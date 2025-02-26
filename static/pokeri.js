//taulukoidaan eri käsien vetotodennäköisyydet
let postflop = {
        "neljä samaa": 0.0426/(1-0.0426),
        "värisuoran väliinveto": 0.0426/(1-0.0426),
        "värisuoran päihinveto": 0.0842/(1-0.0842),
        "kolme samaa": 0.0842/(1-0.0842),
        "korkeampi pari": 0.1249/(1-0.1249),
        "suoran väliinveto": 0.1647/(1-0.1647),
        "täyskäsi": 0.1647/(1-0.1647),
        "kolme samaa tai kaksi paria": 0.2035/(1-0.2035),
        "pari": 0.2414/(1-0.2414),
        "suoran väliinveto tai korkeampi pari": 0.2784/(1-0.2784),
        "suoran päihinveto": 0.3145/(1-0.3145),
        "väri": 0.3497/(1-0.3497),
        "suoran väliinveto tai pari": 0.3839/(1-0.3839),
        "suoran päihinveto tai korkeampi pari": 0.4172/(1-0.4172),
        "suoran väliinveto tai väri": 0.4496/(1-0.4496),
        "väri tai korkeampi pari": 0.4496/(1-0.4496),
        "suoran päihinveto tai pari": 0.5116/(1-0.5116),
        "suoran päihinveto tai väri": 0.5412/(1-0.5412),
        "väri tai pari": 0.5412/(1-0.5412),
        "suoran väliinveto, väri tai korkeampi pari": 0.5412/(1-0.5412),
        "suoran väliinveto, väri tai pari": 0.6244/(1-0.6244),
        "suoran päihinveto, väri tai korkeampi pari": 0.6244/(1-0.6244),
        "suoran päihinveto, väri tai pari": 0.6994/(1-0.6994)
    };
let river = {
        "neljä samaa": 0.0217/(1-0.0217),
        "värisuoran väliinveto": 0.0217/(1-0.0217),
        "värisuoran päihinveto": 0.0435/(1-0.0435),
        "kolme samaa": 0.0435/(1-0.0435),
        "korkeampi pari": 0.0652/(1-0.0652),
        "suoran väliinveto": 0.087/(1-0.087),
        "täyskäsi": 0.087/(1-0.087),
        "kolme samaa tai kaksi paria": 0.1087/(1-0.1087),
        "pari": 0.1304/(1-0.1304),
        "suoran väliinveto tai korkeampi pari": 0.1522/(1-0.1522),
        "suoran päihinveto": 0.1739/(1-0.1739),
        "väri": 0.1957/(1-0.1957),
        "suoran väliinveto tai pari": 0.2174/(1-0.2174),
        "suoran päihinveto tai korkeampi pari": 0.2391/(1-0.2391),
        "suoran väliinveto tai väri": 0.2609/(1-0.2609),
        "väri tai korkeampi pari": 0.2609/(1-0.2609),
        "suoran päihinveto tai pari": 0.3043/(1-0.3043),
        "suoran päihinveto tai väri": 0.3261/(1-0.3261),
        "väri tai pari": 0.3261/(1-0.3261),
        "suoran väliinveto, väri tai korkeampi pari": 0.3261/(1-0.3261),
        "suoran väliinveto, väri tai pari": 0.3913/(1-0.3913),
        "suoran päihinveto, väri tai korkeampi pari": 0.3913/(1-0.3913),
        "suoran päihinveto, väri tai pari": 0.4565/(1-0.4565)
    };

//tehdään responsiivinen navbar
function navbar(){
    var navi = document.getElementById("topnavi");
    if (navi.className === "topnav") {
        navi.className += "responsive";
    }
    else {
        navi.className = "topnav";
    }
}


//käsitellään pottikerroinlaskurin toiminta
function pokeri() {
    //Haetaan potti- ja maksukentän sisältö
    var pottikentta = document.getElementById("potti").value;
    var maksukentta = document.getElementById("maksu").value;
    //Muutetaan desimaalipilkku desimaalipisteeksi potista ja maksusta sekä
    //poistetaan tyhjät
    pottikentta = poistaTyhjatJaMuutaPilkut(pottikentta);
    maksukentta = poistaTyhjatJaMuutaPilkut(maksukentta);
    //asetetaan virhe jos maksu tai potti eivät ole positiivisia lukuja
    var pottivirhe = document.getElementById("pottivirhe");
    var maksuvirhe = document.getElementById("maksuvirhe");
    var pvirhe = "";
    var mvirhe = "";
    var virhe = 0;
    if(tarkistaPoslukukentta(pottikentta) === 0){
        pvirhe = "Syötä positiivinen luku";
        virhe = 1;
    }
    if(tarkistaPoslukukentta(maksukentta) === 0){
        mvirhe = "Syötä positiivinen luku";
        virhe = 1;
    }
    //haetaan tuloselementti
    var tulos = document.getElementById("tulos");
    var maksuflop = document.getElementById("maksuflop");
    maksuflop.innerHTML = ""
    var maksuriver = document.getElementById("maksuriver");
    maksuriver.innerHTML = ""
    //lasketaan pottikerroin ja asetetaan se sivulle jos ei ole virheitä
    //asetetaan virheet sivulle
    if(virhe === 0){
        pottikerroin = maksukentta / pottikentta;
        //listataan vedot, joilla saadulla kertoimella maksetaan
        for(var[kasi, todnak] of Object.entries(postflop)){
            todnak = parseFloat(`${todnak}`);
            if(todnak >= pottikerroin){
                maksuflop.innerHTML += `<li>${kasi}</a></li>`;
            }
        }
        for(var[kasi, todnak] of Object.entries(river)){
            todnak = parseFloat(`${todnak}`);
            if(todnak >= pottikerroin){
                maksuriver.innerHTML += `<li>${kasi}</a></li>`;
            }
        }
        tulos.innerHTML = "Pottikerroin on " +
        (Math.round((pottikerroin + Number.EPSILON) * 100) / 100).toString();
        pottivirhe.innerHTML = pvirhe;
        maksuvirhe.innerHTML = mvirhe;
    }
    else{
        pottivirhe.innerHTML = pvirhe;
        maksuvirhe.innerHTML = mvirhe;
        tulos.innerHTML = "";
    }
}

//käsitellään panoskokolaskurin toiminta
function pokeripanos(){
    //Haetaan pottikentän sisältö
    var pottikentta = document.getElementById("potti").value;
    //Muutetaan desimaalipilkku desimaalipisteeksi potista ja
    //poistetaan tyhjät
    pottikentta = poistaTyhjatJaMuutaPilkut(pottikentta);
    //asetetaan virhe jos potti ei ole positiivinen luku
    var pottivirhe = document.getElementById("pottivirhe");
    var maksuvirhe = document.getElementById("maksuvirhe");
    var pvirhe = "";
    var virhe = 0;
    if(tarkistaPoslukukentta(pottikentta) === 0){
        pvirhe = "Syötä positiivinen luku";
        virhe = 1;
    }
    //haetaan elementit joihin asetetaan tulokset
    var panosflop = document.getElementById("panosflop");
    panosflop.innerHTML = ""
    var panosriver = document.getElementById("panosriver");
    panosriver.innerHTML = ""
    //lasketaan panoksen suuruus eri vetoja vastaan
    //asetetaan virheet sivulle
    if(virhe === 0){
        //listataan vedot ja panos niitä vastaan
        for(var[kasi, todnak] of Object.entries(postflop)){
            todnak = parseFloat(`${todnak}`);
            panos = pottikentta/((1/todnak)-1);
            if(panos > 0 && todnak > 0.1){
                panos = (Math.round((panos + Number.EPSILON) * 10) / 10).toString();
                panosflop.innerHTML += `<li>${kasi}: <b>panos > ${panos}</b></a></li>`;
            }
        }
        for(var[kasi, todnak] of Object.entries(river)){
            todnak = parseFloat(`${todnak}`);
            panos = pottikentta/((1/todnak)-1);
            if(panos > 0 && todnak > 0.1){
                panos = (Math.round((panos + Number.EPSILON) * 10) / 10).toString();
                panosriver.innerHTML += `<li>${kasi}: <b>panos > ${panos}</b></a></li>`;
            }
        }
        pottivirhe.innerHTML = pvirhe;
        maksuvirhe.innerHTML = ""
    }
    else{
        pottivirhe.innerHTML = pvirhe;
        maksuvirhe.innerHTML = ""
    }
}

//Käsitellään valitun pokeridatan näyttäminen
function naytaTiedot(){
    //haetaan valitut tiedot html-elementeistä
    var pelityyppi = document.getElementById("naytatyyppi").value;
    var nimi = document.getElementById("naytanimi").value;
    var alkupvm = document.getElementById("alkupvm").value;
    var loppupvm = document.getElementById("loppupvm").value;
    var sisaanosto = document.getElementById("naytasisaanosto").value;
    var ostovaluutta = document.getElementById("naytaostovaluutta").value;
    var palkinto = document.getElementById("naytavoitot").checked;
    var palkintovaluutta = document.getElementById("naytavoitotvaluutta").value;
    //tarkistetaan päivämäärävalinnan oikeellisuus
    var pvmvirhekentta = document.getElementById("tietohakupvmvirhe");
    var virhe = 0;
    var pvmvirhe = "";
    var alkudatepvm = Date.parse(alkupvm);
    var loppudatepvm = Date.parse(loppupvm);
    if(alkudatepvm > loppudatepvm){
        virhe = 1;
        pvmvirhe = "Alkupvm ei voi olla ennen loppupvm";
    }
    if(virhe === 0){//viedään tiedot pythonille käsiteltäväksi jos ei virheitä
        pvmvirhekentta.innerHTML = pvmvirhe;
        //pythonilla käsiteltäväksi vietävät tiedot
        var server_data = [
            {
                "nappi": "naytatiedot",
                "pelityyppi": pelityyppi,
                "nimi": nimi,
                "alkupvm": alkupvm,
                "loppupvm": loppupvm,
                "sisaanosto": sisaanosto,
                "ostovaluutta": ostovaluutta,
                "palkinto": palkinto,
                "palkintovaluutta": palkintovaluutta
            }
            ];
        //tehdään ajax-kutsu
        $.ajax({
            type: "POST",
            url: "/poskeridata",
            data: JSON.stringify(server_data),
            contentType: "application/json",
            dataType: 'json'
        }).done(function (response){
            console.log(response);
            naytaPokeritiedot(response);
        }).fail(function (response){
            console.log("Virhe tietojen haussa");
        });
    }//astetaan virheet näkyviin jos on virheitä
    else{
        pvmvirhekentta.innerHTML = pvmvirhe;
    }
}

//käsitellään uuden pelin lisäys
function lisaaPeli(){
    //poistetaan nappi jota painettiin
    var nappi = document.getElementById("lisaauusipeli");
    nappi.remove();
    //lisätään sivulle vastauskentät pelin tietoihin sekä peruutusnappi
    var lisayspaikka = document.getElementById("lisaapelikentat");
    lisayspaikka.innerHTML += `<div id="uusipelitietokentat">
            <h2>Syötä pelin tiedot:</h2><label for="pelityypit">Pelityyppi</label>
            <br><select id="pelityypit">
            <option value="Turnaus">Turnaus</option>
            <option value="Spin & Gold"/>Spin & Gold</option>
            <option value="Mystery Battle Royale"/>Mystery Battle Royale</option>
            <option value="Rush & Cash"/>Rush & Cash</option></select>
            <br><br><label for="tnimi">Nimi</label><br>
            <input type="text" id="tnimi"/><br>
            <br><label for="pvm">Päivämäärä</label><br>
            <input type="date" id="pvm"/>
            <p class="virhe" id="pvmvirhe"><br></p>
            <br><label for="sisaanosto">Sisäänosto</label>
            <br><input type="text" id="sisaanosto">
            <select class="valuutta" id="svaluutta">
            <option value="$">$</option>
            <option value="€">€</option>
            <option value="C$">C$</option>
            <option value="T$">T$</option>
            <option value="Lippu">Lippu</option></select>
            <p class="virhe" id="ostovirhe"><br></p>
            <br><label for="sijoitus">Sijoitus</label><br>
            <input type="text" id="sijoitus"/>
            <p class="virhe" id="sijoitusvirhe"><br></p>
            <br><label for="osallistujat">
            Osallistujat</label><br><input type="text" id="osallistujat"/>
            <p class="virhe" id="osallistujavirhe"><br></p>
            <br><label for="palkinto">Palkintorahat</label>
            <br><input type="text" id="palkinto"/>
            <select class="valuutta" id="pvaluutta">
            <option value="$">$</option>
            <option value="€">€</option>
            <option value="C$">C$</option>
            <option value="T$">T$</option>
            <option value="Lippu">Lippu</option></select>
            <p class="virhe" id="palkintovirhe"><br></p>
            <br><br><input type="submit" value="Tallenna"
            onclick="tallennaPeli();"/><br><br><br>
            <input type="submit" value="Peruuta"
            onclick="peliLisatty();"/></div>`;
}

//käsitellään uuden pelin tallennus
function tallennaPeli(){
    //haetaan kenttien arvot
    var pelityyppi = document.getElementById("pelityypit").value;
    var nimi = document.getElementById("tnimi").value;
    var pvm = document.getElementById("pvm").value;
    var sisaanosto = document.getElementById("sisaanosto").value;
    var svaluutta = document.getElementById("svaluutta").value;
    var sijoitus = document.getElementById("sijoitus").value;
    var osallistujat = document.getElementById("osallistujat").value;
    var palkinto = document.getElementById("palkinto").value;
    var pvaluutta = document.getElementById("pvaluutta").value;

    //haetaan virhekentät ja alustetaan virheet
    var pvmvirhe = document.getElementById("pvmvirhe");
    var ostovirhe = document.getElementById("ostovirhe");
    var sijoitusvirhe = document.getElementById("sijoitusvirhe");
    var osallistujavirhe = document.getElementById("osallistujavirhe");
    var palkintovirhe = document.getElementById("palkintovirhe");
    var virhe = 0;
    var pvvirhe = "<br>";
    var ovirhe = "<br>";
    var sijvirhe = "<br>";
    var osvirhe = "<br>";
    var pvirhe = "<br>";
    //tarkistetaan haettujen arvojen oikeellisuus
    nimi = nimi.trim();
    if(pvm === ""){
        virhe = 1;
        pvvirhe = "Valitse päivämäärä";
    }
    sisaanosto = poistaTyhjatJaMuutaPilkut(sisaanosto);
    if(isNaN(sisaanosto) || sisaanosto === "" || sisaanosto < 0){
        virhe = 1;
        ovirhe = "Syötä ei-negatiivinen luku";
    };
    sijoitus = sijoitus.trim();
    osallistujat = osallistujat.trim();
    if(tarkistaPoskokluku(sijoitus) === 0 && pelityyppi != "Rush & Cash"){
        virhe = 1;
        sijvirhe = "Syötä positiivinen kokonaisluku";
    }
    if(tarkistaPoskokluku(osallistujat) === 0 && pelityyppi != "Rush & Cash"){
        virhe = 1;
        osvirhe = "Syötä positiivinen kokonaisluku";
    }
    if(parseInt(sijoitus) > parseInt(osallistujat) && pelityyppi != "Rush & Cash"){
        virhe = 1;
        sijvirhe = "Sijoitus ei voi olla suurempi kuin osallistujamäärä";
        osvirhe = sijvirhe;
    }
    palkinto = poistaTyhjatJaMuutaPilkut(palkinto);
    if(isNaN(palkinto) || palkinto === "" || palkinto < 0){
        virhe = 1;
        pvirhe = "Syötä ei-negatiivinen luku";
    }

    //jos on virhe, asetetaan virheilmoitukset virheelementteihin
    if(virhe != 0){
        pvmvirhe.innerHTML = pvvirhe;
        ostovirhe.innerHTML = ovirhe;
        sijoitusvirhe.innerHTML = sijvirhe;
        osallistujavirhe.innerHTML = osvirhe;
        palkintovirhe.innerHTML = pvirhe;
    }//jos ei virheitä, viedään syöttökenttien tiedot pythonille käsiteltäväksi
    else{
        var uusipelitietokentat = document.getElementById("uusipelitietokentat");
        uusipelitietokentat.remove();
        var uusipelicont = document.getElementById("uusipelicontainer");
        uusipelicont.innerHTML += `<h3>Peli lisätty onnistuneesti</h3>
        <input type="submit" name="pelilisattynappi"
        id="pelilisatty" value="OK" onclick="peliLisatty();"/>`;
        //pythonilla käsiteltäväksi vietävät tiedot
        var server_data = [
            {
                "nappi": "tallennapeli",
                "pelityyppi": pelityyppi,
                "nimi": nimi,
                "pvm": pvm,
                "sisaanosto": sisaanosto,
                "svaluutta": svaluutta,
                "sijoitus": sijoitus,
                "osallistujat": osallistujat,
                "palkinto": palkinto,
                "pvaluutta": pvaluutta
            }
            ];
        //tehdään ajax-kutsu
        $.ajax({
            type: "POST",
            url: "/poskeridata",
            data: JSON.stringify(server_data),
            contentType: "application/json",
            dataType: 'json'
        });
    }
}

//Päivitetään sivu pelin lisäämisen onnistuttua
function peliLisatty(){
    location.reload();
    return false;
}

//käsitellään fc-laivojen gilin jakolaskuri
function laskeGil(){
    //haetaan kenttien arvot tai kentät
    var omagil = document.getElementById("omagil").value;
    var laivagil = document.getElementById("laivagil").value;
    var fcosuus = document.getElementById("fcosuus").value;
    var saajat = document.getElementById("saajat").value;
    var omagilvirhe = document.getElementById("omagilvirhe");
    var laivagilvirhe = document.getElementById("laivagilvirhe");
    var fcosuusvirhe = document.getElementById("fcosuusvirhe");
    var saajavirhe = document.getElementById("saajavirhe");
    var tulos = document.getElementById("fclaivatulos");
    var gilvirhe = document.getElementById("gilvirhe");
    //asetetaan virhemuuttujat
    var virhe = 0;
    var ogvirhe = "";
    var lgvirhe = "";
    var fcvirhe = "";
    var svirhe = "";
    var gvirhe = "";
    //tyhjennetään virheet sivulta
    omagilvirhe.innerHTML = ogvirhe;
    laivagilvirhe.innerHTML = lgvirhe;
    fcosuusvirhe.innerHTML = fcvirhe;
    saajavirhe.innerHTML = svirhe;
    gilvirhe.innerHTML = gvirhe;
    //tarkistetaan kenttien arvojen oikeellisuus, muokataan pilkut tarvittaessa
    //ja poistetaan tyhjät
    fcosuus = poistaTyhjatJaMuutaPilkut(fcosuus);
    omagil = omagil.trim();
    laivagil = laivagil.trim();
    saajat = saajat.trim();
    if(tarkistaPoskokluku(omagil) === 0){
        virhe = 1;
        ogvirhe = "Syötä positiivinen kokonaisluku";
    }
    if(tarkistaPoskokluku(laivagil) === 0){
        virhe = 1;
        lgvirhe = "Syötä positiivinen kokonaisluku";
    }
    if(tarkistaPoslukukentta(fcosuus) === 0){
        virhe = 1;
        fcvirhe = "Syötä positiivinen luku"
    }
    if(tarkistaPoskokluku(saajat) === 0){
        virhe = 1;
        svirhe = "Syötä positiivinen kokonaisluku";
    }
    //lasketaan gilmäärät tai asetetaan virheet näkyviin jos niitä on
    if(virhe === 0){
        var tuotugil = laivagil - omagil;
    }
    if(tuotugil <= 0){
        virhe = 1;
        gvirhe = "Laiva ei tuonut yhtään giliä";
    }
    if(virhe === 0){
        fcrahat = "Laiva toi " + tuotugil + " giliä.";
        fclle = parseInt((fcosuus/100)*tuotugil);
        pelaajalle = parseInt((((100 - fcosuus)/100)*tuotugil)/saajat);
        fclaivatulos.innerHTML = `${fcrahat}, fc:lle menee <b>${fclle}</b> gil ja
                pelaajille <b>${pelaajalle}</b> gil.`;
    }
    else{
        fclaivatulos.innerHTML = "";
        omagilvirhe.innerHTML = ogvirhe;
        laivagilvirhe.innerHTML = lgvirhe;
        fcosuusvirhe.innerHTML = fcvirhe;
        saajavirhe.innerHTML = svirhe;
        gilvirhe.innerHTML = gvirhe;
    }
}

//Näytetään kaikki pelit tietoineen kun painetaan nappia
function naytaKaikki(){
    var nayta = document.getElementById("kaikkitiedot");
    var naytanappi = document.getElementById("naytanappi");
    naytanappi.setAttribute("value", "Piilota");
    naytanappi.setAttribute("onclick", "piilotaKaikki();");
    nayta.removeAttribute("Hidden");
}

//Piilotetaan kaikki pelit tietoineen kun painetaan nappia
function piilotaKaikki(){
    var nayta = document.getElementById("kaikkitiedot");
    var naytanappi = document.getElementById("naytanappi");
    naytanappi.setAttribute("value", "Näytä");
    naytanappi.setAttribute("onclick", "naytaKaikki();");
    nayta.setAttribute("hidden", "hidden");
}

//Mahdollistetaan aamupalataulukon muokkaus
function muokkaaAamupala(){
    var aamupaladivi = document.getElementById("aamupalalista");
    var taulukko = document.getElementById("aamupalabody");
    var aamupalaotsikot = document.getElementById("aamupalaotsikot");
    aamupalaotsikot.innerHTML += `<th scope="col" id="poistaaamupalasarake">Poista rivi</th>`
    var muokkaanappi = document.getElementById("muokkaaaamupala");
    muokkaanappi.remove();
    var lisaarivinappi = document.getElementById("lisaaaamupalarivi");
    lisaarivinappi.remove();
    var rivit = taulukko.rows.length;
    for(let i = 0; i < rivit; i++){
        taulukko.innerHTML += `<tr><td><input type="text" id="tuote${i + 1}"/></td>
                    <td><input type="text" id="hinta${i + 1}"/></td>
                    <td><input type="text" id="tarvitaan${i + 1}"/></td>
                    <td><input type="text" id="ostettu${i + 1}"/></td>
                    <td><input type="text" id="hintaero${i + 1}"/></td>
                    <td><input type="checkbox" class="adminbox" name="poistaaamu${i + 1}"</td></tr>`;

        console.log("jööti");
    }
    aamupaladivi.innerHTML += `<input type="submit"
                    value="Tallenna" id="tallennaaamupalataulu"
                    onclick="tallennaAamupalat()"/>`;
}

//Lisätään aamupalataulukkoon uusi rivi
function lisaaAamupalarivi(){
    var taulukko = document.getElementById("aamupalabody");
    var rivinro = taulukko.rows.length;
    var muokkaanappi = document.getElementById("muokkaaaamupala");
    muokkaanappi.remove();
    var lisaarivinappi = document.getElementById("lisaaaamupalarivi");
    lisaarivinappi.remove();
    var aamupaladivi = document.getElementById("aamupalalista");
    taulukko.innerHTML += `<tr><td><input type="text" id="tuote${rivinro + 1}"/></td>
                    <td><input type="text" id="hinta${rivinro + 1}"/></td>
                    <td><input type="text" id="tarvitaan${rivinro + 1}"/></td>
                    <td><input type="text" id="ostettu${rivinro + 1}"/></td>
                    <td><input type="text" id="hintaero${rivinro + 1}"/></td></tr>`

    aamupaladivi.innerHTML += `<input type="submit"
                    value="Tallenna" id="tallennaaamupalataulu"
                    onclick="tallennaAamupalat()"/>`;
}

//Tallennetaan aamupalataulun tiedot ja näytetään staattinen aamupalataulu
function tallennaAamupalat(){
    var taulukko = document.getElementById("aamupalabody");
    var aamupalat = [];
    rivimaara = taulukko.rows.length;
    //haetaan taulukon arvot
    for(var rivi = 0; rivi < rivimaara; rivi++){
        for(var sarake = 0, i = taulukko.rows[rivi].cells.length; sarake < i; sarake++){
            aamupalat.push(taulukko.rows[rivi].cells[sarake].childNodes[0].value);
        }
    }
    //asetetaan taulukon arvot jsoniin avain-arvo-pareiksi
    var aamupalajson = {};
    aamupalajson[rivimaara] = {};
    var apulaskuri = 1;
    var otsikkolaskuri = 1;
    for(let i = 1; i < aamupalat.length + 1; i++){
        if(otsikkolaskuri === 1){
            aamupalajson[rivimaara][`tuote${apulaskuri}`] = aamupalat[i - 1];
        }
        if(otsikkolaskuri === 2){
            aamupalajson[rivimaara][`hinta${apulaskuri}`] = aamupalat[i - 1];
        }
        if(otsikkolaskuri === 3){
            aamupalajson[rivimaara][`tarvii${apulaskuri}`] = aamupalat[i - 1];
        }
        if(otsikkolaskuri === 4){
            aamupalajson[rivimaara][`ostettu${apulaskuri}`] = aamupalat[i - 1];
        }
        if(otsikkolaskuri === 5){
            aamupalajson[rivimaara][`hintaero${apulaskuri}`] = aamupalat[i - 1];
        }
        if(otsikkolaskuri === 5){
            apulaskuri += 1;
            otsikkolaskuri = 1;
        }
        otsikkolaskuri += 1;
    }
    //tehdään ajax-kutsu
        $.ajax({
            type: "POST",
            url: "/aamupalatallennus",
            data: JSON.stringify(aamupalajson),
            contentType: "application/json",
            dataType: 'json'
        }).done(function (response){
            console.log(response);
            aamupalaLisatty(response);
        }).fail(function (response){
            console.log("Virhe tietojen haussa");
        });
}

//käsitellään aamupalan lisäyksen onnistuminen
function aamupalaLisatty(aamupalat){
    var taulukko = document.getElementById("aamupalabody");
    taulukko.innerHTML = "";
    var rivilaskuri = 1;
    for(i in aamupalat){
        tuote = `tuote${i}`;
        tuote = aamupalat[i][tuote];
        hinta = `hinta${i}`;
        hinta = aamupalat[i][hinta];
        tarvii = `tarvii${i}`;
        tarvii = aamupalat[i][tarvii];
        ostettu = `ostettu${i}`;
        ostettu = aamupalat[i][ostettu];
        hintaero = `hintaero${i}`;
        hintaero = aamupalat[i][hintaero];
        taulukko.innerHTML += `<tr><td>${tuote}</td>
                            <td>${hinta}</td><td>${tarvii}</td>
                            <td>${ostettu}</td><td>${hintaero}</td></tr>`;
    }

    }

//käsitellään aamupalan poisto
function poistaAamupala(){
    //haetaan taulukon arvot
    for(var rivi = 0; rivi < rivimaara; rivi++){
        for(var sarake = 0, i = taulukko.rows[rivi].cells.length; sarake < i; sarake++){
            if(taulukko.rows[rivi].cells[sarake].childNodes[0].type != "checkbox"){
                aamupalat.push(taulukko.rows[rivi].cells[sarake].childNodes[0].value);
            }
            else{
                aamupalat.push(taulukko.rows[rivi].cells[sarake].childNodes[0].checked);
            }
        }
    }
}

//------------------------------------------------------------------------------
//funktioita

//tarkistetaan positiivisten lukujen kenttä
function tarkistaPoslukukentta(tark){
    if(isNaN(tark) || tark === "" || tark <= 0){
        return 0;
    }
    return 1;
}

//tarkistetaan onko muuttuja melko tarkasti positiivinen kokonaisluku
function tarkistaPoskokluku(tark){
    if(isNaN(tark) || parseInt(tark) - parseFloat(tark) != 0 || tark === "" || tark <= 0){
        return 0;
    }
    return 1;
}

//muutetaan pilkku pisteeksi ja poistetaan tyhjät
function poistaTyhjatJaMuutaPilkut(muok){
    muok = muok.replace(",",".");
    muok = muok.trim();
    return muok;
}

//asetetaan haetut tiedot pokeridatasta näkyviin
function naytaPokeritiedot(haetuttiedot){
    //haetaan elementti, jossa tiedot näytetään ja alustetaan tarvittavat muuttujat
    var tietolista = document.getElementById("kaikkitiedot");
    var pelimaarakentta = document.getElementById("pelimaara");
    pelimaara = 0;
    tietolista.innerHTML = "";
    var palkintorahat = 0;
    var ostorahat = 0;
    var palkintodollarit = 0;
    var ostodollarit = 0;
    var palkintocdollarit = 0;
    var ostocdollarit = 0;
    var palkintotdollarit = 0;
    var ostotdollarit = 0;
    var palkintoeurot = 0;
    var ostoeurot = 0;
    var palkintoliput = 0;
    var ostoliput = 0;
    //muuttuja sijoituskeskiarvojen laskemiseen jos haettiin vain tiettyä pelityyppiä
    var pelkkaspin = 1;
    var spinsijoitus = 0;
    var spinosallistujat = 0;
    var pelkkaturnaus = 1;
    var turnaussijoitus = 0;
    var turnausosallistujat = 0;
    var pelkkamystery = 1;
    var mysterysijoitus = 0;
    var mysteryosallistujat = 0;
    //lasketaan palkinnot eri valuutoissa
    for(var i in haetuttiedot){
        if(haetuttiedot[i].Pelityyppi != "Spin & Gold"){
            pelkkaspin = 0;
        }
        if(pelkkaspin === 1){
            spinsijoitus += haetuttiedot[i].Sijoitus;
            spinosallistujat += haetuttiedot[i].Osallistujat;
        }
        if(haetuttiedot[i].Pelityyppi != "Turnaus"){
            pelkkaturnaus = 0;
        }
        if(pelkkaturnaus === 1){
            turnaussijoitus += haetuttiedot[i].Sijoitus;
            turnausosallistujat += haetuttiedot[i].Osallistujat;
        }
        if(haetuttiedot[i].Pelityyppi != "Mystery Battle Royale"){
            pelkkamystery = 0;
        }
        if(pelkkamystery === 1){
            mysterysijoitus += haetuttiedot[i].Sijoitus;
            mysteryosallistujat += haetuttiedot[i].Osallistujat;
        }
        pelimaara += 1;
        palkintorahat += parseFloat(haetuttiedot[i].Palkintorahat);
        ostorahat += parseFloat(haetuttiedot[i].Sisäänosto);
        if(haetuttiedot[i].Palkintovaluutta === "$"){
            palkintodollarit += parseFloat(haetuttiedot[i].Palkintorahat);
        }
        if(haetuttiedot[i].Ostovaluutta === "$"){
            ostodollarit += parseFloat(haetuttiedot[i].Sisäänosto);
        }
        if(haetuttiedot[i].Palkintovaluutta === "C$"){
            palkintocdollarit += parseFloat(haetuttiedot[i].Palkintorahat);
        }
        if(haetuttiedot[i].Ostovaluutta === "C$"){
            ostocdollarit += parseFloat(haetuttiedot[i].Sisäänosto);
        }
        if(haetuttiedot[i].Palkintovaluutta === "T$"){
            palkintotdollarit += parseFloat(haetuttiedot[i].Palkintorahat);
        }
        if(haetuttiedot[i].Ostovaluutta === "T$"){
            ostotdollarit += parseFloat(haetuttiedot[i].Sisäänosto);
        }
        if(haetuttiedot[i].Palkintovaluutta === "€"){
            palkintoeurot += parseFloat(haetuttiedot[i].Palkintorahat);
        }
        if(haetuttiedot[i].Ostovaluutta === "€"){
            ostoeurot += parseFloat(haetuttiedot[i].Sisäänosto);
        }
        if(haetuttiedot[i].Palkintovaluutta === "Lippu"){
            palkintoliput += parseFloat(haetuttiedot[i].Palkintorahat);
        }
        if(haetuttiedot[i].Ostovaluutta === "Lippu"){
            ostoliput += parseFloat(haetuttiedot[i].Sisäänosto);
        }
        //lisätään elementit näytettäville tiedoille ja muokataan luvut
        //näyttämään aina kaksi desimaalia sekä päivämäärä mielekkääseen muotoon
        tietolista.innerHTML += `<li>Peli<ul id="tietoalkiot${i}"></ul></li>`;
        var alatietolista = document.getElementById("tietoalkiot" + i);
        sisaanosto = parseFloat(haetuttiedot[i].Sisäänosto);
        sisaanosto = (Math.round((sisaanosto + Number.EPSILON)*100)/100).toFixed(2);
        palkinto = parseFloat(haetuttiedot[i].Palkintorahat);
        palkinto = (Math.round((palkinto + Number.EPSILON)*100)/100).toFixed(2);
        pvm = new Date(haetuttiedot[i].Päivämäärä).toLocaleDateString();
        alatietolista.innerHTML += `<li>Pelityyppi: ${haetuttiedot[i].Pelityyppi}</li>
                            <li>Nimi: ${haetuttiedot[i].Nimi}</li>
                            <li>Päivämäärä: ${pvm}</li>
                            <li>Sisäänosto: ${sisaanosto}</li>
                            <li>Ostovaluutta: ${haetuttiedot[i].Ostovaluutta}</li>
                            <li>Sijoitus: ${haetuttiedot[i].Sijoitus}</li>
                            <li>Osallistujat: ${haetuttiedot[i].Osallistujat}</li>
                            <li>Palkintorahat: ${palkinto}</li>
                            <li>Palkintovaluutta: ${haetuttiedot[i].Palkintovaluutta}</li></ul></li>`;

    }
    var palkintokentta = document.getElementById("palkintokentta");
    var kaikkipalkinnot = document.getElementById("kaikkipalkinnot");
    var sisaanostokentta = document.getElementById("sisaanostokentta");
    var kaikkisisaanostot = document.getElementById("kaikkisisaanostot");
    var voittotappiokentta = document.getElementById("voittotappio");
    var sijoituskentta = document.getElementById("sijoituskentta");
    sijoituskentta.innerHTML = "";
    if(pelkkaspin === 1){
        keskispinsij = (Math.round((spinsijoitus/pelimaara + Number.EPSILON)*100)/100).toFixed(2);
        keskispinos = (Math.round((spinosallistujat/pelimaara + Number.EPSILON)*100)/100).toFixed(2);
        sijoituskentta.innerHTML += `Keskisijoitus on <b>${keskispinsij}</b> osallistujamäärästä ${keskispinos}`
    }
    if(pelkkaturnaus === 1){
        keskiturnaussij = ((Math.round((turnaussijoitus/turnausosallistujat + Number.EPSILON)*100)/100)*100).toFixed(0);
        sijoituskentta.innerHTML += `Sijoitusprosentti on <b>${keskiturnaussij}</b> %`
    }
    if(pelkkamystery === 1){
        keskimysterysij = (Math.round((mysterysijoitus/pelimaara + Number.EPSILON)*100)/100).toFixed(2);
        keskimysteryos = (Math.round((mysteryosallistujat/pelimaara + Number.EPSILON)*100)/100).toFixed(2);
        sijoituskentta.innerHTML += `Keskisijoitus on <b>${keskimysterysij}</b> osallistujamäärästä ${keskimysteryos}`
    }
    voittotappiokentta.innerHTML = "<h2>Voitto/tappio dollareissa:</h2>";
    palkintokentta.innerHTML = "";
    sisaanostokentta.innerHTML = "";
    if(palkintodollarit > 0){
        palkintodollarit = (Math.round((palkintodollarit + Number.EPSILON)*100)/100).toFixed(2);
        palkintokentta.innerHTML += `Palkinto $ yhteensä: <b>$${palkintodollarit}</b><br>`;
    }
    if(palkintocdollarit > 0){
        palkintocdollarit = (Math.round((palkintocdollarit + Number.EPSILON)*100)/100).toFixed(2);
        palkintokentta.innerHTML += `Palkinto C$ yhteensä: <b>C$${palkintocdollarit}</b><br>`;
    }
    if(palkintotdollarit > 0){
        palkintotdollarit = (Math.round((palkintotdollarit + Number.EPSILON)*100)/100).toFixed(2);
        palkintokentta.innerHTML += `Palkinto T$ yhteensä: <b>T$${palkintotdollarit}</b><br>`;
    }
    if(palkintoeurot > 0){
        palkintoeurot = (Math.round((palkintoeurot + Number.EPSILON)*100)/100).toFixed(2);
        palkintokentta.innerHTML += `Palkinto € yhteensä: <b>${palkintoeurot}€</b><br>`;
    }
    if(palkintoliput > 0){
        palkintoliput = (Math.round((palkintoliput + Number.EPSILON)*100)/100).toFixed(2);
        palkintokentta.innerHTML += `Palkintoliput yhteensä: <b>${palkintoliput}</b><br>`;
    }
    if(ostodollarit > 0){
        ostodollarit = (Math.round((ostodollarit + Number.EPSILON)*100)/100).toFixed(2);
        sisaanostokentta.innerHTML += `Sisäänosto $ yhteensä: <b>$${ostodollarit}</b><br>`;
    }
    if(ostocdollarit > 0){
        ostocdollarit = (Math.round((ostocdollarit + Number.EPSILON)*100)/100).toFixed(2);
        sisaanostokentta.innerHTML += `Sisäänosto C$ yhteensä: <b>C$${ostocdollarit}</b><br>`;
    }
    if(ostotdollarit > 0){
        ostotdollarit = (Math.round((ostotdollarit + Number.EPSILON)*100)/100).toFixed(2);
        sisaanostokentta.innerHTML += `Sisäänosto T$ yhteensä: <b>T$${ostotdollarit}</b><br>`;
    }
    if(ostoeurot > 0){
        ostoeurot = (Math.round((ostoeurot + Number.EPSILON)*100)/100).toFixed(2);
        sisaanostokentta.innerHTML += `Sisäänosto € yhteensä: <b>${ostoeurot}€</b><br>`;
    }
    if(ostoliput > 0){
        ostoliput = (Math.round((ostoliput + Number.EPSILON)*100)/100).toFixed(2);
        sisaanostokentta.innerHTML += `Sisäänostoliput yhteensä: <b>${ostoliput}</b><br>`;
    }
    palkintorahat = (Math.round((palkintorahat + Number.EPSILON)*100)/100).toFixed(2);
    ostorahat = (Math.round((ostorahat + Number.EPSILON)*100)/100).toFixed(2);
    voittotappiodol = (Math.round(((ostodollarit - palkintodollarit) + Number.EPSILON)*100)/100).toFixed(2);
    voittotappio = (Math.round(((ostorahat - palkintorahat) + Number.EPSILON)*100)/100).toFixed(2);
    var palautusprosenttidol = ((Math.round((palkintodollarit/ostodollarit + Number.EPSILON)*100)/100)*100).toFixed(0);
    var palautusprosenttirahat = ((Math.round((palkintorahat/ostorahat + Number.EPSILON)*100)/100)*100).toFixed(0);
    kaikkipalkinnot.innerHTML = `<br>Kaikki palkinnot yhteensä: <b>${palkintorahat}</b>`;
    kaikkisisaanostot.innerHTML = `<br>Kaikki sisäänostot yhteensä: <b>${ostorahat}</b>`;
    if(voittotappiodol <= 0){
        voittotappiokentta.innerHTML += `Voittoa yhteensä $${-voittotappiodol} ja
                            palautusprosentti on ${palautusprosenttidol} %`
    }
    if(voittotappiodol > 0){
        voittotappiokentta.innerHTML += `Tappiota yhteensä $${voittotappiodol} ja
                            palautusprosentti on ${palautusprosenttidol} %`
    }
    voittotappiokentta.innerHTML += `<br><h2>Voitto/tappio kaikilla valuutoilla:</h2>`
    if(voittotappio <= 0){
        voittotappiokentta.innerHTML += `Voittoa yhteensä ${-voittotappio} ja
                            palautusprosentti on ${palautusprosenttirahat} %`
    }
    if(voittotappio > 0){
        voittotappiokentta.innerHTML += `Tappiota yhteensä ${voittotappio} ja
                            palautusprosentti on ${palautusprosenttirahat} %`
    }
    pelimaarakentta.innerHTML = `<p>Pelejä yhteensä ${pelimaara}</p>`;
}