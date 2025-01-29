#!/usr/bin/python
# -*- coding: utf-8 -*-
#author Jiri Lahtinen
#version 29.1.2025

from flask import Flask, session, redirect, url_for, request, render_template, jsonify
import hashlib
from functools import wraps
from datetime import datetime, timedelta
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.secret_key = 'xxx'

#valmistellaan tietokantayhteys
SQLALCHEMY_DATABASE_URI = "mysql+mysqlconnector://{username}:{password}@{hostname}/{databasename}".format(
    username="xxx",
    password="xxx",
    hostname="xxx",
    databasename="xxx",
)
app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI
app.config["SQLALCHEMY_POOL_RECYCLE"] = 299
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

tietokanta = SQLAlchemy(app)

#talous tietokanta
class Talous(tietokanta.Model):

    __tablename__ = "talous"

    id = tietokanta.Column(tietokanta.Integer, primary_key=True)
    tunnus = tietokanta.Column(tietokanta.String(4096))
    tulot = tietokanta.Column(tietokanta.JSON)
    menot = tietokanta.Column(tietokanta.JSON)
    kesto = tietokanta.Column(tietokanta.JSON)

#tunnukset tietokanta
class Tunnukset(tietokanta.Model):

    __tablename__ = "tunnukset"

    id = tietokanta.Column(tietokanta.Integer, primary_key=True)
    tunnus = tietokanta.Column(tietokanta.String(4096))
    salasana = tietokanta.Column(tietokanta.String(4096))
    email = tietokanta.Column(tietokanta.String(4096))

#pokeripelit tietokanta
class Pokeripelit(tietokanta.Model):

    __tablename__ = "pokeripelit"

    pelityyppi = tietokanta.Column(tietokanta.String(255))
    nimi = tietokanta.Column(tietokanta.String(255))
    paivamaara = tietokanta.Column(tietokanta.Date)
    sisaanosto = tietokanta.Column(tietokanta.Float(20, 2))
    ostovaluutta = tietokanta.Column(tietokanta.String(255))
    sijoitus = tietokanta.Column(tietokanta.Integer)
    osallistujat = tietokanta.Column(tietokanta.Integer)
    palkintorahat = tietokanta.Column(tietokanta.Float(20, 2))
    palkintovaluutta = tietokanta.Column(tietokanta.String(255))
    tunnus = tietokanta.Column(tietokanta.String(4096))
    id = tietokanta.Column(tietokanta.Integer, primary_key=True)

def auth(f):
    ''' Tämä decorator hoitaa kirjautumisen tarkistamisen ja ohjaa
    tarvittaessa kirjautumissivulle
    '''
    @wraps(f)
    def decorated(*args, **kwargs):
        if not 'kirjautunut' in session:
            return redirect(url_for('logoutvarma'))
        return f(*args, **kwargs)
    return decorated


def authAdmin(f):
    ''' Tämä decorator hoitaa adminin kirjautumisen tarkistamisen ja ohjaa tarvittaessa kirjautumissivulle
    '''
    @wraps(f)
    def decorated(*args, **kwargs):
        if not 'admin' in session:
            return redirect(url_for('logoutvarma'))
        return f(*args, **kwargs)
    return decorated


#kirjautumissivun käsittely
@app.route('/kirjaudu', methods=['POST', 'GET'])
def kirjaudu():
    #asetetaan virhemuuttuja
    virhe = 0
    #tarkistusmuuttuja käyttäjän löytymiselle tietokannasta
    loytyiko = 0
    try:
        session.pop('onnistui', None)
    except Exception:
        pass

    #noudetaan html lomakkeelta syötetyt tiedot jos onnistuu
    try:
        tunnus = request.form['tunnus']
    except KeyError:
        tunnus = ""
    try:
        salasana = request.form['salasana']
    except KeyError:
        salasana = ""

    tunnustrimmattu = tunnus.strip()
    oikeaTunnus = ""
    oikeaSalasana = ""
    #haetaan tietokannasta syötetty tunnus ja sen salasana
    tiedot = tietokanta.select(Tunnukset).where(Tunnukset.tunnus == tunnustrimmattu)
    try:
        with tietokanta.engine.connect() as yhteys:
            for rivi in yhteys.execute(tiedot):
                tietopaska = rivi
        oikeaTunnus = tietopaska[1]
        oikeaSalasana = tietopaska[2]
        loytyiko = 1
    except:
        virhe = 1

    #enkoodataan tietokannan tunnus ja salasana
    oikea = hashlib.sha512()
    oikea.update(oikeaTunnus.encode("UTF-8"))
    oikea.update(oikeaSalasana.encode("UTF-8"))
    #enkoodataan lomakkeelta haettu tunnus ja salasana
    m = hashlib.sha512()
    m.update(tunnustrimmattu.encode("UTF-8"))
    m.update(salasana.encode("UTF-8"))
    #alustetaan lomakkeen kentät
    kentat = {"tunnus":"","salasana":""}
    errors = dict(kentat)

    #varmistetaan, että lomake on lähetetty ja tehdään tarkistukset sekä asetetaan sessiomuuttujat onnistuessa
    if request.method == 'POST':
        #jos tunnus on admin, siirrytään admin-sivulle
        if m.hexdigest() == oikea.hexdigest() and tunnustrimmattu == "admin":
            session['kirjautunut'] = "ok"
            session['kayttaja'] = tunnustrimmattu
            session['admin'] = "ok"
            return redirect(url_for('admin'))
        #asetetaan virheet jos adminin salasana oli väärä
        if tunnustrimmattu == "admin":
            kentat["tunnus"] = "admin"
            if not len(salasana):
                errors["salasana"] = u"Syötä salasana"
            else:
                errors["salasana"] = u"Väärä salasana"
            return render_template('kirjaudu.html', kentat=kentat, errors=errors)
        #asetetaan virhe jos syötettyä tunnusta ei löydy tai jos tunnusta tai salasanaa ei ole syotetty
        for i in errors:
            try:
                kentat[i] = request.form[i]
            except KeyError:
                errors[i] = "!"
            if i == "tunnus" and loytyiko != 1:
                errors[i] = u"Käyttäjää ei löydy!"
                virhe = 1
            if not len(kentat[i].strip()):
                errors[i] = u"Syötä " + str(i) + "!"
                virhe = 1

        #siirrytään etusivulle jos tarkistukset menivät läpi
        if m.hexdigest() == oikea.hexdigest() and virhe == 0:
            session['kirjautunut'] = "ok"
            session['kayttaja'] = tunnustrimmattu
            return redirect(url_for('budjetti'))
        else:
            #täällä asetetaan virheteksti jos ainoa virhe oli väärä ja epätyhjä salasana
            if loytyiko == 1 and len(kentat["salasana"]):
                errors["salasana"] = u"Väärä salasana!"
                return render_template('kirjaudu.html', kentat=kentat, errors=errors)

    return render_template('kirjaudu.html', kentat=kentat, errors=errors)


#luotunnus sivun käsittely
@app.route('/luotunnus', methods=['POST', 'GET'])
def luotunnus():
    #alustetaan lomakkeen kentät
    kentat = {"tunnus":"","salasana":"","toistasalasana":"", "email":"", "onnistui":""}
    virheet = dict(kentat)

    #haetaan lomakkeelle syötetyt tiedot
    try:
        uusitunnus = request.form['uusitunnus']
    except:
        uusitunnus = ""
    try:
        uusisalasana = request.form['uusisalasana']
    except:
        uusisalasana = ""
    try:
        toistasalasana = request.form['toistasalasana']
    except:
        toistasalasana = "paska"
    try:
        email = request.form['email']
    except:
        email = ""

    #haetaan tietokannasta tunnukset ja sähköpostit
    tietopaskatunnus = []
    tietopaskaemail = []
    tiedot = tietokanta.select(Tunnukset.tunnus, Tunnukset.email)
    with tietokanta.engine.connect() as yhteys:
        for rivi in yhteys.execute(tiedot):
            tietopaskatunnus.append(rivi[0])
            tietopaskaemail.append(rivi[1])

    #alustetaan virhemuuttuja
    virhe = 0

    #käsitellään tunnuksen luonti kun painetaan "Luo tunnus" nappia
    try:
        if "luouusitunnus" in request.form:
            if request.method == 'POST':
                session["onnistui"] = ""
                #tarkistetaan vastaavatko syötetyt salasanat toisiaan
                if not uusisalasana == toistasalasana:
                    virhe = 1
                    virheet['toistasalasana'] = u"Salasanat eivät vastaa toisiaan"

                #tarkistetaan onko tunnuksen päissä tyhjää
                if len(uusitunnus) > len(uusitunnus.strip()):
                    virhe = 1
                    virheet['tunnus'] = u"Ei välilyöntejä tunnuksen alkuun tai loppuun"

                #tarkistetaan onko syötetyt tiedot tyhjiä
                if not len(uusitunnus):
                    virhe = 1
                    virheet['tunnus'] = u"Syötä tunnus"
                if not len(email):
                    virhe = 1
                    virheet['email'] = u"Syötä sähköpostiosoite"

                #tarkistetaan onko uusi tunnus jo olemassa
                if uusitunnus in tietopaskatunnus:
                    virhe = 1
                    virheet['tunnus'] = u"Tunnus varattu"

                #tarkistetaan onko syötetty sähköposti jo tietokannassa
                if email in tietopaskaemail:
                    virhe = 1
                    virheet['email'] = u"Sähköpostilla on jo tunnus"

                #tarkistetaan salasanan pituus
                if len(uusisalasana) < 7:
                    virhe = 1
                    virheet['salasana'] = u"Salasanan pitää olla vähintään 8 merkkiä pitkä"

                #jos kaikki on kunnossa, luodaan tunnus tietokantaan ja ilmoitetaan onnistumisesta
                if virhe == 0:
                    lisaa = tietokanta.insert(Tunnukset).values(tunnus = uusitunnus, salasana = uusisalasana, email = email)
                    with tietokanta.engine.connect() as yhteys:
                        yhteys.execute(lisaa)

                    tulot = {}
                    menot = {}
                    huominen = datetime.now() + timedelta(1)
                    budjettiaika = {"alkuaika": str(datetime.now())[0:10], "loppuaika": str(huominen)[0:10]}
                    lisaa2 = tietokanta.insert(Talous).values(tunnus = uusitunnus, tulot= tulot, menot=menot, kesto=budjettiaika)
                    with tietokanta.engine.connect() as yhteys:
                        yhteys.execute(lisaa2)
                    session["onnistui"] = u"Tunnus luotu onnistuneesti"
                    return redirect(url_for('luotunnus'))

                return render_template('luotunnus.html', kentat=kentat, virheet=virheet)

    except KeyError:
        error = u"Nappia ei löytynyt"


    return render_template('luotunnus.html', kentat=kentat, virheet=virheet)


#admin etusivun käsittely
@app.route('/admin', methods=['POST', 'GET'])
@authAdmin
def admin():
    tietopaska = []
    #haetaan käyttäjät tietokannasta
    tiedot = tietokanta.select(Tunnukset.tunnus, Tunnukset.email)
    with tietokanta.engine.connect() as yhteys:
        for rivi in yhteys.execute(tiedot):
            tietopaska.append(rivi)
    tunnukset = tietopaska
    tunnukset.remove(("admin", "riolufin@gmail.com"))

    #haetaan poistettavat tunnukset lomakkeelta
    poistettavat = []
    for i in tunnukset:
        try:
            if request.form[str(i[0]) + "poisto"] == "on":
                poistettavat.append(i[0])
        except:
            continue
    #käsitellään tunnuksen poisto kun painetaan "Poista" nappia
    try:
        if "poista" in request.form:
            if request.method == 'POST':
                if len(poistettavat):
                    for p in poistettavat:
                        poista = tietokanta.delete(Tunnukset).where(Tunnukset.tunnus == p)
                        with tietokanta.engine.connect() as yhteys:
                            yhteys.execute(poista)
                        poista = tietokanta.delete(Talous).where(Talous.tunnus == p)
                        with tietokanta.engine.connect() as yhteys:
                            yhteys.execute(poista)
                    return redirect('admin')

                return render_template('admin.html', tunnukset=tunnukset)
    except KeyError:
        error = "Nappia ei löytynyt"
    return render_template('admin.html', tunnukset=tunnukset)


#etusivun käsittely
@app.route('/budjetti', methods=['POST', 'GET'])
@auth
def budjetti():
    #tarkistetaan onko käyttäjä admin ja jos on, siirrytään admin-sivulle
    if(session["kayttaja"] == "admin"):
        return redirect(url_for('admin'))

    #haetaan käyttäjän tiedot tietokannasta
    tiedot = tietokanta.select(Talous).where(Talous.tunnus == session["kayttaja"])
    with tietokanta.engine.connect() as yhteys:
        for rivi in yhteys.execute(tiedot):
            tietopaska = rivi
    #asetetaan tietokannan tiedot muuttujiin ja järjestetään tulot ja menot
    tulot = tietopaska[2]
    tulot = dict(sorted(tulot.items()))
    menot = tietopaska[3]
    menot = dict(sorted(menot.items()))
    budjettiaika = tietopaska[4]


    #lasketaan tulot ja menot yhteen
    try:
        lopputulot = round(sum(tulot.values()), 2)
    except:
        lopputulot = 1
    try:
        loppumenot = round(sum(menot.values()), 2)
    except:
        loppumenot = 1
    lopputulos = round(lopputulot - loppumenot, 2)

    try:
        tulo = request.form["uusitulo"]
    except KeyError:
        tulo = ""
    try:
        summa = request.form["uusitulosumma"]
    except KeyError:
        summa = ""

    #jos syötetty tulo on jo tiedostossa, lisätään sen perään luku
    kierros = 0
    lisaluku = 2
    while tulo in tulot:
        if kierros != 0:
            tulo = tulo[:-1]
            tulo = tulo + str(lisaluku)
            lisaluku += 1
        else:
            tulo = tulo + str(lisaluku)
            lisaluku += 1
            kierros = 1

    #luodaan muuttuja summan muodon tarkistusta varten
    korjattusumma = 0
    #luodaan virhemuuttuja
    virhe = 0

    #luodaan kenttämuuttujat ja dictit virheiden esittämistä varten
    budjettikesto = datetime.strptime(budjettiaika["loppuaika"],"%Y-%m-%d") - datetime.strptime(budjettiaika["alkuaika"],"%Y-%m-%d")
    kentat = {"tulo": "", "summa": "", "meno": "", "menosumma": "", "alkuaika": budjettiaika["alkuaika"], "loppuaika": budjettiaika["loppuaika"], "kesto": budjettikesto.days,
                "tulot": lopputulot, "menot": loppumenot, "tulos": lopputulos, "paivabudjetti" : round(lopputulos/budjettikesto.days, 2)}
    virheet = dict(kentat)
    virheet["alkuaika"] = ""

    #käsitellään budjetin ajanjakson valinta
    try:
        if "vahvistaaika" in request.form:
            if request.method == 'POST':
                try:
                    alkuaika = request.form["alkuaika"]
                    alkuvertaus = alkuaika
                    alkuaika = datetime.strptime(alkuaika, "%Y-%m-%d")
                except:
                    alkuaika = datetime.now()
                try:
                    loppuaika = request.form["loppuaika"]
                    loppuvertaus = loppuaika
                    loppuaika = datetime.strptime(loppuaika, "%Y-%m-%d")
                except:
                    loppuaika = datetime.now()
                #huolehditaan, että ilman muutoksia ei turhaan päivitetä tietokantaa
                if str(alkuvertaus) == str(budjettiaika["alkuaika"]) and str(loppuvertaus) == str(budjettiaika["loppuaika"]):
                    virhe = 1
                kesto = loppuaika - alkuaika
                if kesto.days <= 0:
                    virhe = 1
                    virheet["alkuaika"] = u"Alkupäivä pitää olla ennen loppupäivää!"
                if virhe == 0: #päivitetään tietokantaan uudet päivämäärät
                    budjettiaika["alkuaika"] = str(alkuaika)[0:10]
                    budjettiaika["loppuaika"] = str(loppuaika)[0:10]
                    paivitys = tietokanta.update(Talous).where(Talous.tunnus == session["kayttaja"]).values(kesto=budjettiaika)
                    with tietokanta.engine.connect() as yhteys:
                        yhteys.execute(paivitys)
                    return redirect(url_for('budjetti'))

                return render_template('budjetti.html', tulot=tulot, menot=menot, virheet=virheet, kentat=kentat)

    except KeyError:
        error = u"Nappia ei löytynyt"

    #käsitellään tulon lisäys kun painetaan "Lisää tulo" nappia
    try:
        if "lisaatulo" in request.form:
            if request.method == 'POST':
                if not len(tulo.strip()):
                    virheet["tulo"] = u"Syötä tulo"
                    virhe = 1
                if not len(summa.strip()):
                    virheet["summa"] = u"Syötä summa"
                    virhe = 1
                else:
                    try:
                        korjattusumma = summa.replace(",", ".")
                        korjattusumma = round(float(korjattusumma), 2)
                    except:
                        virheet["summa"] = u"Syötä luku"
                        virhe = 1
                if virhe == 0:
                    tulot[tulo] = korjattusumma
                    paivitys = tietokanta.update(Talous).where(Talous.tunnus == session["kayttaja"]).values(tulot=tulot)
                    with tietokanta.engine.connect() as yhteys:
                        yhteys.execute(paivitys)
                    return redirect(url_for('budjetti'))

                return render_template('budjetti.html', tulot=tulot, menot=menot, virheet=virheet, kentat=kentat)
    except KeyError:
        error = "Nappia ei löytynyt"

    #käsitellään tulon muokkaus kun painetaan "Muokkaa tuloja" nappia
    try:
        if "muokkaatulo" in request.form:
            if request.method == 'POST':
                session["muokkaa"] = 1
                return render_template('budjetti.html', tulot=tulot, menot=menot, virheet=virheet, kentat=kentat)
    except KeyError:
        error = "Nappia ei löytynyt"

    #haetaan lomakkeelta tarvittavat tiedot tulojen muokkausta varten
    muokatuttulot = {}
    muuttuiko = 0
    for i, j in tulot.items():
        try:
            tulo = request.form[i]
        except KeyError:
            tulo = ""
        try:
            summa = request.form[i + "summa"]
        except KeyError:
            summa = ""
        tarksumma = str(summa.strip())
        tarksumma = tarksumma.replace(",", ".")
        tarktulo = str(tulo.strip())
        if str(tarktulo) != i or tarksumma != str(j):
            muuttuiko = 1
        muokatuttulot[tarktulo] = summa
    #käsitellään tulon muokkauksen tallennus kun painetaan "Tallenna" nappia
    try:
        if "tallennatulo" in request.form:
            if request.method == 'POST':
                if len(muokatuttulot) < len(tulot):
                    virheet["tulo"] = u"Tyhjä tai saman niminen tulo ei kelpaa"
                    virhe = 1
                for i, j in muokatuttulot.items():
                    if not len(i.strip()):
                        virheet["tulo"] = u"Tyhjä tai saman niminen tulo ei kelpaa"
                        virhe = 1
                        break
                    if not len(j.strip()):
                        virheet["summa"] = u"Tyhjä summa ei kelpaa"
                        virhe = 1
                        break
                    else:
                        try:
                            korjattusumma = j.replace(",", ".")
                            korjattusumma = round(float(korjattusumma), 2)
                            muokatuttulot[i] = korjattusumma
                        except:
                            virheet["summa"] = u"Summan pitää olla luku"
                            virhe = 1
                            break
                if virhe == 0  and muuttuiko == 1:
                    paivitys = tietokanta.update(Talous).where(Talous.tunnus == session["kayttaja"]).values(tulot=muokatuttulot)
                    with tietokanta.engine.connect() as yhteys:
                        yhteys.execute(paivitys)
                    session.pop("muokkaa", None)
                    return redirect('budjetti')

                return render_template('budjetti.html', tulot=tulot, menot=menot, virheet=virheet, kentat=kentat)
    except KeyError:
        error = "Nappia ei löytynyt"

    #käsitellään tulomuokkauksen peruutus kun painetaan "Peruuta" nappia
    try:
        if "peruutatulo" in request.form:
            if request.method == 'POST':
                session.pop("muokkaa", None)
                return redirect('budjetti')
    except KeyError:
        error = "Nappia ei löytynyt"

    #käsitellään tulojen poisto kun painetaan "Poista tuloja" nappia
    try:
        if "poistatulo" in request.form:
            if request.method == 'POST':
                session["poistatulo"] = 1
                return redirect('budjetti')
    except KeyError:
        error = "Nappia ei löytynyt"

    #haetaan poistettavat tulot lomakkeelta
    poistettavattulot = []
    for i in tulot:
        try:
            if request.form[i + "poisto"] == "on":
                poistettavattulot.append(i)
        except:
            continue
    #käsitellään tulon poisto kun painetaan "Poista" nappia
    try:
        if "poistavarmatulo" in request.form:
            if request.method == 'POST':
                if len(poistettavattulot):
                    for p in poistettavattulot:
                        if p in tulot:
                            tulot.pop(p)
                    paivitys = tietokanta.update(Talous).where(Talous.tunnus == session["kayttaja"]).values(tulot=tulot)
                    with tietokanta.engine.connect() as yhteys:
                        yhteys.execute(paivitys)
                    session.pop("poistatulo", None)
                    return redirect('budjetti')

                return render_template('budjetti.html', tulot=tulot, menot=menot, virheet=virheet, kentat=kentat)
    except KeyError:
        error = "Nappia ei löytynyt"

    #käsitellään tulopoiston peruutus kun painetaan "Peruuta" nappia
    try:
        if "peruutapoistotulo" in request.form:
            if request.method == 'POST':
                session.pop("poistatulo", None)
                return redirect('budjetti')
    except KeyError:
        error = "Nappia ei löytynyt"

    #käsitellään menolomakkeen toiminnot vastaavasti kuin tulolomakkeen
    try:
        meno = request.form["uusimeno"]
    except KeyError:
        meno = ""
    try:
        menosumma = request.form["uusimenosumma"]
    except KeyError:
        menosumma = ""

    #jos syötetty meno on jo tiedostossa, lisätään sen perään luku
    menokierros = 0
    menolisaluku = 2
    while meno in menot:
        if menokierros != 0:
            meno = meno[:-1]
            meno = meno + str(menolisaluku)
            menolisaluku += 1
        else:
            meno = meno + str(menolisaluku)
            menolisaluku += 1
            menokierros = 1

    #luodaan virhemuuttuja
    menovirhe = 0

    #Käsitellään menon lisäys kun painetaan "Lisää meno" nappia
    try:
        if "lisaameno" in request.form:
            if request.method == 'POST':
                if not len(meno.strip()):
                    virheet["meno"] = u"Syötä meno"
                    menovirhe = 1
                if not len(menosumma.strip()):
                    virheet["menosumma"] = u"Syötä summa"
                    menovirhe = 1
                else:
                    try:
                        korjattumenosumma = menosumma.replace(",", ".")
                        korjattumenosumma = round(float(korjattumenosumma), 2)
                    except:
                        virheet["menosumma"] = u"Syötä luku"
                        menovirhe = 1
                if menovirhe == 0:
                    menot[meno] = korjattumenosumma
                    paivitys = tietokanta.update(Talous).where(Talous.tunnus == session["kayttaja"]).values(menot=menot)
                    with tietokanta.engine.connect() as yhteys:
                        yhteys.execute(paivitys)
                    return redirect(url_for('budjetti'))

                return render_template('budjetti.html', tulot=tulot, menot=menot, virheet=virheet, kentat=kentat)
    except KeyError:
        error = "Nappia ei löytynyt"

    #käsitellään menon muokkaus kun painetaan "Muokkaa menoja" nappia
    try:
        if "muokkaameno" in request.form:
            if request.method == 'POST':
                session["muokkaameno"] = 1
                return render_template('budjetti.html', tulot=tulot, menot=menot, virheet=virheet, kentat=kentat)
    except KeyError:
        error = "Nappia ei löytynyt"

    #haetaan lomakkeelta tarvittavat tiedot menojen muokkausta varten
    muokatutmenot = {}
    muuttuikomeno = 0
    for i, j in menot.items():
        try:
            meno = request.form[i]
        except KeyError:
            meno = ""
        try:
            menosumma = request.form[i + "summa"]
        except KeyError:
            menosumma = ""
        tarkmenosumma = str(menosumma.strip())
        tarkmenosumma = tarkmenosumma.replace(",", ".")
        tarkmeno = str(meno.strip())
        if str(tarkmeno) != i or tarkmenosumma != str(j):
            muuttuikomeno = 1
        muokatutmenot[tarkmeno] = menosumma
    #käsitellään menon muokkauksen tallennus kun painetaan "Tallenna" nappia
    try:
        if "tallennameno" in request.form:
            if request.method == 'POST':
                if len(muokatutmenot) < len(menot):
                    virheet["meno"] = u"Tyhjä tai saman niminen tulo ei kelpaa"
                    menovirhe = 1
                for i, j in muokatutmenot.items():
                    if not len(i.strip()):
                        virheet["meno"] = u"Tyhjä meno ei kelpaa"
                        menovirhe = 1
                        break
                    if not len(menosumma.strip()):
                        virheet["menosumma"] = u"Tyhjä summa ei kelpaa"
                        menovirhe = 1
                        break
                    else:
                        try:
                            korjattumenosumma = j.replace(",", ".")
                            korjattumenosumma = round(float(korjattumenosumma), 2)
                            muokatutmenot[i] = korjattumenosumma
                        except:
                            virheet["menosumma"] = u"Summan pitää olla luku"
                            menovirhe = 1
                            break
                if menovirhe == 0  and muuttuikomeno == 1:
                    paivitys = tietokanta.update(Talous).where(Talous.tunnus == session["kayttaja"]).values(menot=muokatutmenot)
                    with tietokanta.engine.connect() as yhteys:
                        yhteys.execute(paivitys)
                    session.pop("muokkaameno", None)
                    return redirect('budjetti')

                return render_template('budjetti.html', tulot=tulot, menot=menot, virheet=virheet, kentat=kentat)
    except KeyError:
        error = "Nappia ei löytynyt"

    #käsitellään menomuokkauksen peruutus kun painetaan "Peruuta" nappia
    try:
        if "peruutameno" in request.form:
            if request.method == 'POST':
                session.pop("muokkaameno", None)
                return redirect('budjetti')
    except KeyError:
        error = "Nappia ei löytynyt"

    #käsitellään menojen poisto kun painetaan "Poista menoja" nappia
    try:
        if "poistameno" in request.form:
            if request.method == 'POST':
                session["poistameno"] = 1
                return redirect('budjetti')
    except KeyError:
        error = "Nappia ei löytynyt"

    #haetaan poistettavat menot lomakkeelta
    poistettavatmenot = []
    for i in menot:
        try:
            if request.form[i + "poisto"] == "on":
                poistettavatmenot.append(i)
        except:
            continue
    #käsitellään menon poisto kun painetaan "Poista" nappia
    try:
        if "poistavarmameno" in request.form:
            if request.method == 'POST':
                if len(poistettavatmenot):
                    for p in poistettavatmenot:
                        if p in menot:
                            menot.pop(p)
                    paivitys = tietokanta.update(Talous).where(Talous.tunnus == session["kayttaja"]).values(menot=menot)
                    with tietokanta.engine.connect() as yhteys:
                        yhteys.execute(paivitys)
                    session.pop("poistameno", None)
                    return redirect('budjetti')

                return render_template('budjetti.html', tulot=tulot, menot=menot, virheet=virheet, kentat=kentat)
    except KeyError:
        error = "Nappia ei löytynyt"

    #käsitellään menopoiston peruutus kun painetaan "Peruuta" nappia
    try:
        if "peruutapoistomeno" in request.form:
            if request.method == 'POST':
                session.pop("poistameno", None)
                return redirect('budjetti')
    except KeyError:
        error = "Nappia ei löytynyt"

    return render_template('budjetti.html', tulot=tulot, menot=menot, virheet=virheet, kentat=kentat)


#logout sivun käsittely
@app.route('/logout', methods=['POST', 'GET'])
@auth
def logout():
    return render_template('logout.html')


#käsitellään uloskirjautuminen
@app.route('/logoutvarma')
def logoutvarma():
    session.pop('kirjautunut', None)
    session.pop('kayttaja', None)
    session.pop('muokkaa', None)
    session.pop('poistatulo', None)
    if 'admin' in session:
        session.pop('admin', None)
    return redirect(url_for('kirjaudu'))

#käsitellään pokerisivun toiminnot
@app.route('/poskeri', methods=['POST', 'GET'])
@auth
def poskerijutut():
    #tarkistetaan onko käyttäjä admin ja jos on, siirrytään admin-sivulle
    if(session["kayttaja"] == "admin"):
        return redirect(url_for('admin'))

    return redirect(url_for('pokeri'))


#käsitellään pokerisivu
@app.route('/pokeri', methods=['POST', 'GET'])
@auth
def pokeri():
    #tarkistetaan onko käyttäjä admin ja jos on, siirrytään admin-sivulle
    if(session["kayttaja"] == "admin"):
        return redirect(url_for('admin'))
    return render_template('pokeri.html')

#käsitellään pokeridatasivun toiminnot
@app.route('/poskeridata', methods=['POST', 'GET'])
@auth
def poskeridatajutut():
    #tarkistetaan onko käyttäjä admin ja jos on, siirrytään admin-sivulle
    if(session["kayttaja"] == "admin"):
        return redirect(url_for('admin'))
    #käsitellään kaikki POST-pyynnöt
    if request.method == "POST":
        pokeritiedot = request.get_json()
        pokeritietodict = pokeritiedot[0]
        #haetaan tietokannasta pyydetyt tiedot jos painettu nappi oli naytatiedotnappi
        if(pokeritietodict["nappi"] == "naytatiedot"):
            #jos hakuehtona on kaikki, asetetaan hakutermi tietokantahakua varten
            #niin että haettaessa valitaan kaikki
            for key in pokeritietodict:
                if(pokeritietodict[key] == "Kaikki"):
                    pokeritietodict[key] = "%%"
            #käsitellään palkintocheckboxin toiminta
            if(pokeritietodict["palkinto"] == True):
                pokeritietodict["palkinto"] = 0
            else:
                pokeritietodict["palkinto"] = -1
            #käsitellään päivämäärävälin valinta
            if(pokeritietodict["alkupvm"] == ""):
                pokeritietodict["alkupvm"] = "0000-01-01"
            if(pokeritietodict["loppupvm"] == ""):
                pokeritietodict["loppupvm"] = "9999-01-01"
            kantatiedot = []
            tiedot = dict()
            #haetaan tietokannasta tiedot annetuilla ehdoilla
            haetuttiedot = tietokanta.select(Pokeripelit.palkintorahat,
                            Pokeripelit.palkintovaluutta, Pokeripelit.pelityyppi,
                            Pokeripelit.nimi, Pokeripelit.paivamaara,
                            Pokeripelit.sisaanosto, Pokeripelit.ostovaluutta,
                            Pokeripelit.sijoitus, Pokeripelit.osallistujat,
                            Pokeripelit.id).where(
                                Pokeripelit.tunnus == session["kayttaja"]
                                ).where(
                                    Pokeripelit.pelityyppi.like(pokeritietodict["pelityyppi"])
                                    ).where(
                                    Pokeripelit.nimi.like(pokeritietodict["nimi"])
                                    ).where(
                                    Pokeripelit.sisaanosto.like(pokeritietodict["sisaanosto"] + '%')
                                    ).where(
                                    Pokeripelit.ostovaluutta.like(pokeritietodict["ostovaluutta"])
                                    ).where(
                                    Pokeripelit.palkintovaluutta.like(pokeritietodict["palkintovaluutta"])
                                    ).where(Pokeripelit.palkintorahat > pokeritietodict["palkinto"]
                                    ).where(Pokeripelit.paivamaara >= pokeritietodict["alkupvm"]
                                    ).where(Pokeripelit.paivamaara <= pokeritietodict["loppupvm"])
            with tietokanta.engine.connect() as yhteys:
                for rivi in yhteys.execute(haetuttiedot):
                    kantatiedot.append(rivi)
            for i in kantatiedot:
                tiedot.update({i[9]:{
                            "Pelityyppi": i[2],
                            "Nimi": i[3],
                            "Päivämäärä": i[4],
                            "Sisäänosto": i[5],
                            "Ostovaluutta": i[6],
                            "Sijoitus": i[7],
                            "Osallistujat": i[8],
                            "Palkintorahat": i[0],
                            "Palkintovaluutta": i[1]
                            }})
            return jsonify(tiedot)

        #lisätään peli tietokantaan jos painettu nappi oli uuden pelin tallennus
        if(pokeritietodict["nappi"] == "tallennapeli"):
            lisaapeli = tietokanta.insert(Pokeripelit).values(
                pelityyppi = pokeritietodict["pelityyppi"],
                nimi = pokeritietodict["nimi"], paivamaara = pokeritietodict["pvm"],
                sisaanosto = pokeritietodict["sisaanosto"],
                ostovaluutta = pokeritietodict["svaluutta"],
                sijoitus = pokeritietodict["sijoitus"],
                osallistujat = pokeritietodict["osallistujat"],
                palkintorahat = pokeritietodict["palkinto"],
                palkintovaluutta = pokeritietodict["pvaluutta"],
                tunnus = session["kayttaja"])
            with tietokanta.engine.connect() as yhteys:
                yhteys.execute(lisaapeli)

    return redirect(url_for('pokeridata'))


#käsitellään pokeridatasivu
@app.route('/pokeridata', methods=['POST', 'GET'])
@auth
def pokeridata():
    #tarkistetaan onko käyttäjä admin ja jos on, siirrytään admin-sivulle
    if(session["kayttaja"] == "admin"):
        return redirect(url_for('admin'))

    #haetaan käyttäjän tiedot tietokannasta
    palkintotiedot = []
    palkintorahat = 0
    palkintodollarit = 0
    palkintocdollarit = 0
    palkintotdollarit = 0
    palkintoeurot = 0
    palkintoliput = 0
    hakupalkkitiedot = pokeritietohakupalkki()
    uniikittyypit = hakupalkkitiedot[0]
    uniikitnimet = hakupalkkitiedot[1]
    uniikitostot = hakupalkkitiedot[2]
    uniikitostovaluutat = hakupalkkitiedot[3]
    uniikitpalkintovaluutat = hakupalkkitiedot[4]
    rahatiedot = tietokanta.select(Pokeripelit.palkintorahat,
                    Pokeripelit.palkintovaluutta, Pokeripelit.pelityyppi,
                    Pokeripelit.nimi, Pokeripelit.paivamaara,
                    Pokeripelit.sisaanosto, Pokeripelit.ostovaluutta,
                    Pokeripelit.sijoitus, Pokeripelit.osallistujat,
                    Pokeripelit.id).where(Pokeripelit.tunnus == session["kayttaja"])
    with tietokanta.engine.connect() as yhteys:
        for rivi in yhteys.execute(rahatiedot):
            palkintotiedot.append(rivi)
    tiedot = dict()
    for i in palkintotiedot:
        tiedot.update({i[9]:{
                            "Pelityyppi": i[2],
                            "Nimi": i[3],
                            "Päivämäärä": i[4],
                            "Sisäänosto": i[5],
                            "Ostovaluutta": i[6],
                            "Sijoitus": i[7],
                            "Osallistujat": i[8],
                            "Palkintorahat": i[0],
                            "Palkintovaluutta": i[1]
                            }})
    for i, j in tiedot.items():
        j["Sisäänosto"] = round(j["Sisäänosto"], 2)
        j["Palkintorahat"] = round(j["Palkintorahat"], 2)
        if(j["Palkintovaluutta"] == "$"):
            palkintodollarit += j["Palkintorahat"]
        elif(j["Palkintovaluutta"] == "C$"):
            palkintocdollarit += j["Palkintorahat"]
        elif(j["Palkintovaluutta"] == "T$"):
            palkintotdollarit += j["Palkintorahat"]
        elif(j["Palkintovaluutta"] == "€"):
            palkintoeurot += j["Palkintorahat"]
        elif(j["Palkintovaluutta"] == "Lippu"):
            palkintoliput += j["Palkintorahat"]
        palkintorahat += j["Palkintorahat"]

    rahat = {"palkintorahat": palkintorahat}
    palkinnot = {"$": palkintodollarit,
                "C$": palkintocdollarit,
                "T$": palkintotdollarit,
                "€": palkintoeurot,
                "liput": palkintoliput}
    return render_template('pokeridata.html', rahat=rahat, palkinnot=palkinnot,
    pelityypit=sorted(uniikittyypit), nimet=sorted(uniikitnimet),
    ostot=sorted(uniikitostot), ostovaluutat=sorted(uniikitostovaluutat),
    palkintovaluutat=sorted(uniikitpalkintovaluutat), tiedot=tiedot)


#käsitellään FC-laivojen gilinjakolaskuri
@app.route('/fclaiva', methods=['POST', 'GET'])
@auth
def fclaiva():
    #tarkistetaan onko käyttäjä admin ja jos on, siirrytään admin-sivulle
    if(session["kayttaja"] == "admin"):
        return redirect(url_for('admin'))
    return render_template('fclaiva.html')

#haetaan tietokannasta tiedot pokeridatan hakupalkkia varten
def pokeritietohakupalkki():
    #haetaan käyttäjän tiedot tietokannasta
    palkintotiedot = []
    uniikittyypit = dict()
    uniikitnimet = dict()
    uniikitostot = dict()
    uniikitostovaluutat = dict()
    uniikitpalkintovaluutat = dict()
    rahatiedot = tietokanta.select(Pokeripelit.palkintorahat,
                    Pokeripelit.palkintovaluutta, Pokeripelit.pelityyppi,
                    Pokeripelit.nimi, Pokeripelit.paivamaara,
                    Pokeripelit.sisaanosto, Pokeripelit.ostovaluutta,
                    Pokeripelit.sijoitus, Pokeripelit.osallistujat,
                    Pokeripelit.id).where(Pokeripelit.tunnus == session["kayttaja"])
    with tietokanta.engine.connect() as yhteys:
        for rivi in yhteys.execute(rahatiedot):
            palkintotiedot.append(rivi)
    for i in palkintotiedot:
        uniikittyypit.update({i[2]: ""})
        uniikitnimet.update({i[3]: ""})
        uniikkiosto = format(round(float(i[5]), 2), '.2f')
        uniikitostot.update({uniikkiosto: ""})
        uniikitostovaluutat.update({i[6]: ""})
        uniikitpalkintovaluutat.update({i[6]: ""})
    #poistetaan mahdolliset tyhjät
    try:
        del uniikitnimet[""]
    except:
        print("tuhottavaa ei löytynyt")
    return [uniikittyypit, uniikitnimet, uniikitostot, uniikitostovaluutat, uniikitpalkintovaluutat]

if __name__ == '__main__':
    app.debug = True
    app.run(debug=True)