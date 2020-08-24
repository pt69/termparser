//MIT-Lizenz: Copyright (c) 2018 Matthias Perenthaler
//
//Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
//
//The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

//
// Der Quellcode basiert auf dem Artikel:
// https://medium.freecodecamp.org/parsing-math-expressions-with-javascript-7e8f5572276e
// von Shalvah A. (Mai 2017)

var eingabe, button;
var termEingabe = "(7^2+(5+3))*((7/4)-sin(28+4*6))";

//Berechnung von links nach rechts oder von rechts nach links
var opAssoziativitaet = {
    "^" : "rechts",
    "*" : "links",
    "/" : "links",
    "+" : "links",
    "-" : "links"
};

//Rangfolge der Operatoren: Potenz vor Punkt vor Strich
var opRangfolge = {
    "^" : 4,
    "*" : 3,
    "/" : 3,
    "+" : 2,
    "-" : 2
};
    
//Mathematischer atomarer Ausdruck mit Typ, Wert, Rangfolge und Assoziativität
function Token(typ, wert) {
   this.typ = typ;
   this.wert = wert;
   this.operatorRangfolge = function() {
     return opRangfolge[this.wert];
   }
   this.operatorAssoziativitaet = function() {
     return opAssoziativitaet[this.wert];
   }   
}

var yPos = 40;
var xPos = 20;
  
function setup() {
  createCanvas(windowWidth, windowHeight); 

  eingabe = createInput();
  eingabe.position(xPos, yPos+45);
  eingabe.size(320,18);
  eingabe.value(termEingabe);

  button = createButton('Berechne!');
  button.position(eingabe.x + eingabe.width+10, yPos+45);
  button.mousePressed(termEinlesen);
}

function draw() {
    background(255);  
    
    push();
    stroke("SlateGray");
    strokeWeight(8);
    noFill();
    rect(0,0,width,height);
    pop(); 

    textSize(30);
    textAlign(CENTER);  
    text("Termberechnung (Abstrakter-Syntax-Baum)", width/2, yPos);
    
    //Leerzeichen aus termString löschen
    termEingabe = termEingabe.replace(/\s+/g,"");   
    
    //Term parsen und Abstrakten-Syntax-Baum anlegen
    var asbWurzel = parse(termEingabe);
    
    //Abstrakten-Syntax-Baum ausgeben
    push();
    translate(0,180);
    asbDrucker(asbWurzel, width/2, 30, 1);
    pop();
    
    //Ergebnis des Terms berechnen
    var ergebnis = berechne(asbWurzel);
    
    textSize(18);
    textAlign(LEFT);    
    text("Mathematisch korrekten Term eingeben:", 13, yPos+30);         
    text(termEingabe, 20, yPos+100);            
    text("= " + ergebnis, 20, yPos+125);
}

function termEinlesen() {
  termEingabe = eingabe.value();
}

//Berechnung des Ergebnisses
var berechne = function(asb) {
    var ergebnis;
    
    //rekursive Berechnung des Terms
    switch(asb.token) {
        case '+':
            ergebnis = parseFloat(berechne(asb.linkerKindKnoten)) + parseFloat(berechne(asb.rechterKindKnoten));
            break;
        case '*':
            ergebnis = parseFloat(berechne(asb.linkerKindKnoten)) * parseFloat(berechne(asb.rechterKindKnoten));
            break;  
        case '-':
            ergebnis = parseFloat(berechne(asb.linkerKindKnoten)) - parseFloat(berechne(asb.rechterKindKnoten));
            break;
        case '/':
            ergebnis = parseFloat(berechne(asb.linkerKindKnoten)) / parseFloat(berechne(asb.rechterKindKnoten));
            break;
        case '^':
            ergebnis = Math.pow(parseFloat(berechne(asb.linkerKindKnoten)), parseFloat(berechne(asb.rechterKindKnoten)));
            break;
        case 'sin':
            ergebnis = Math.sin(parseFloat(berechne(asb.rechterKindKnoten)));
            break;
        case 'cos':
            ergebnis = Math.cos(parseFloat(berechne(asb.rechterKindKnoten)));
            break;          
        default:
            ergebnis = parseFloat(asb.token);
    }
    return ergebnis;
}

//Ausgabe des Abstrakten-Syntax-Baums (ASB)
function asbDrucker(asb, xT, yT, level) {
    var yDelta = 15*level;
    var xDelta = (0.4*width)/Math.pow(1.9,level);

    if (asb.rechterKindKnoten != null) {
        push();
        stroke("DarkSlateGray");
        strokeWeight(5);
        line(xT, yT, xT+xDelta, yT+yDelta);     
        pop();
        asbDrucker(asb.rechterKindKnoten, xT+xDelta, yT+yDelta, level+1);
    }
    if (asb.linkerKindKnoten != null) {
        push();
        stroke("SlateGray");
        strokeWeight(5);        
        line(xT, yT, xT-xDelta, yT+yDelta); 
        pop();
        asbDrucker(asb.linkerKindKnoten, xT-xDelta, yT+yDelta, level+1);
    }
    ellipse(xT, yT, 35, 35);
  
    textSize(18);
    textAlign(CENTER);
    text(asb.token, xT, yT+6);
}

//Zeichenerkennung (Komma, Ziffer, Buchstabe, Operator, Klammer)
function istKomma(zeichen) {
    return /,/.test(zeichen);
}
function istZiffer(zeichen) {
    return /\d/.test(zeichen);
}
function istBuchstabe(zeichen) {
    return /[a-z]/i.test(zeichen);
}
function istOperator(zeichen) {
    return /\+|-|\*|\/|\^/.test(zeichen);
}
function istLinkeKlammer(zeichen) {
    return /\(/.test(zeichen);
}
function istRechteKlammer(zeichen) {
    return /\)/.test(zeichen);
}

//Uebertragung des Terms in ein Array
function tokenize(termString) {
    //termString in ein Array von einzelnen Zeichen umwandeln
    termStringArray = termString.split("");

    //leere HilfsArrays anlegen
    var termTokenArray=[];
    var buchstabenSpeicher=[];
    var ziffernSpeicher=[];

    //jedes einzelne Zeichen wird eingelesen und einer mathematischen Bedeutung zugeordnet
    termStringArray.forEach(function (zeichen, index) {
        //wenn das Zeichen eine Ziffer ist,
        if(istZiffer(zeichen)) {
            //dann speichere es in ziffernSpeicher
            ziffernSpeicher.push(zeichen);
        //wenn das Zeichen ein Punkt ist,
        } else if(zeichen == ".") {
            //dann gehört es zu einer Zahl, also speichere es in ziffernSpeicher
            ziffernSpeicher.push(zeichen);
        //wenn das Zeichen ein Buchstabe ist,
        } else if (istBuchstabe(zeichen)) {
            //und wenn es Ziffern im ziffernSpeicher gibt
            if(ziffernSpeicher.length) {
                //dann uebernehme diese Ziffern als Zahl in termTokenArray und loesche ziffernSpeicher
                ziffernSpeicheralsZahlleeren();
                //dann haenge an termTokenArray das Token Operator und * an, denn zwischen einer Zahl und einer Variablen steht immer ein Mal-Operator
                termTokenArray.push(new Token("Operator", "*"));
            }
            //dann haenge es an buchstabenSpeicher an
            buchstabenSpeicher.push(zeichen);
        //wenn das Zeichen ein Operator ist,
        } else if (istOperator(zeichen)) {
            //dann pruefe den ziffernSpeicher
            ziffernSpeicheralsZahlleeren();
            //dann pruefe den buchstabenSpeicher
            buchstabenSpeicheralsVariableleeren();
            //dann haenge den Operator an termTokenArray an
            termTokenArray.push(new Token("Operator", zeichen));
        //wenn das Zeichen eine linke Klammer ist, 
        } else if (istLinkeKlammer(zeichen)) {
            //und wenn der buchstabenSpeicher nicht leer ist
            if(buchstabenSpeicher.length) {
                //dann sind die Buchstaben vor der Klammer eine Funktion, und haenge diese an termTokenArray an
                termTokenArray.push(new Token("Funktion", buchstabenSpeicher.join("")));
                //dann leere den buchstabenSpeicher
                buchstabenSpeicher = [];
            //wenn der ziffernSpeicher nicht leer ist,
            } else if(ziffernSpeicher.length) {
                //dann haenge die Zahl an termTokenArray an
                ziffernSpeicheralsZahlleeren();
                //und setze den * Operator zwischen Zahl und Klammer, da zwischen Zahl und Klammer immer ein * ist
                termTokenArray.push(new Token("Operator", "*"));
            }
            //dann haenge Linke Klammer an termTokenArray an
            termTokenArray.push(new Token("Linke Klammer", zeichen));
        //wenn das Zeichen eine rechte Klammer ist,
        } else if (istRechteKlammer(zeichen)) {
            //dann werte den buchstabenSpeicher aus
            buchstabenSpeicheralsVariableleeren();
            //dann werte den ziffernSpeicher aus
            ziffernSpeicheralsZahlleeren();
            //dann haenge rechte Klammer an termTokenArray an
            termTokenArray.push(new Token("Rechte Klammer", zeichen));
        //wenn das Zeichen ein Komma ist,
        } else if (istKomma(zeichen)) {
            //dann werte den ziffernSpeicher aus
            ziffernSpeicheralsZahlleeren();
            //dann werte den buchstabenSpeicher aus
            buchstabenSpeicheralsVariableleeren();
            //dann haenge ein Komma als Argument-Trenner an termTokenArray an
            termTokenArray.push(new Token("Funktionsargument Trennzeichen", zeichen));
        }
    });
    //wenn der ziffernSpeicher nicht leer ist,
    if (ziffernSpeicher.length) {
        //dann werte den ziffernSpeicher aus
        ziffernSpeicheralsZahlleeren();
    }
    //wenn der buchstabenSpeicher nicht leer ist,
    if(buchstabenSpeicher.length) {
        //dann werte den buchstabenSpeicher aus
        buchstabenSpeicheralsVariableleeren();
    }
    //gib das termTokenArray zurueck
    return termTokenArray;

    //interpretiere die Buchstaben als Variable und haenge sie an termTokenArray an
    function buchstabenSpeicheralsVariableleeren() {
        var l = buchstabenSpeicher.length;
        for (var i = 0; i < l; i++) {
            termTokenArray.push(new Token("Variable", buchstabenSpeicher[i]));
          //zwischen Variablen steht ein Mal-Zeichen *  
          if(i < l-1) {
            termTokenArray.push(new Token("Operator", "*"));
          }
        }
        //leere den Buchstabenspeicher
        buchstabenSpeicher = [];
    }

    //interpretiere Ziffern als Zahl und haenge sie an termTokenArray an
    function ziffernSpeicheralsZahlleeren() {
        //wenn ziffernSpeicher nicht leer ist, dann
        if (ziffernSpeicher.length) {
            //haenge an termTokenArray ein Token "Zahl" mit dem Inhalt von ziffernSpeicher als Zahl an
            termTokenArray.push(new Token("Zahl", ziffernSpeicher.join("")));
            //leere den ziffernSpeicher
            ziffernSpeicher = [];
        }
     }
}

//lege im Abstrakten-Syntax-Baum einen neuen Knoten mit dem Wert token und linkem und rechten Kindknoten an
function ASBKnoten(token, linkerKindKnoten, rechterKindKnoten) {
    this.token = token.wert;
    this.linkerKindKnoten = linkerKindKnoten;
    this.rechterKindKnoten = rechterKindKnoten;
}

//Parse den Term
function parse(term){
    //Array ausgabeStapel
    var ausgabeStapel = [];
    //Array speicherStapel
    var speicherStapel = [];

    //fuege an den Array-Prototyp die neue Methode addKnoten hinzu
    Array.prototype.addKnoten = function(speicherStapelletztesElement) {
        //dem rechterKindKnoten wird speicherStapelletztesElement zugeordnet und das
        //letzte Element des aufrufenden Arrays wird entfernt
        rechterKindKnoten = this.pop();
        //Wenn der Typ von speicherStapelletztesElement Funktion ist, dann ist linkerKindKnoten null, da eine Funktion
        //den auszwertenden Ausdruck rechts in Klammer stehend uebernimmt
        if (speicherStapelletztesElement.typ === "Funktion") {
            linkerKindKnoten = null;
        }
        else {
            linkerKindKnoten = this.pop();
        }
        //haenge an das aufrufende Array einen neuen ASBKnoten an
        this.push(new ASBKnoten(speicherStapelletztesElement, linkerKindKnoten, rechterKindKnoten));
    }

    //schneide das letzte Element des aufrufenden Arrays ab und gib dieses zurueck
    Array.prototype.letzterEintrag = function() {
        return this.slice(-1)[0];
    };

    //uebersetze den term in mathematisch interpretierbare Tokens
    var tokens = tokenize(term);

    //SOLANGE Tokens verfügbar sind: Token einlesen.
    tokens.forEach(function(v) {
        //WENN Token IST-Zahl: 
        if(v.typ === "Zahl" || v.typ === "Variable" ) {
            //Token ZU Ausgabe.
            ausgabeStapel.push(new ASBKnoten(v, null, null));
        } 
        //WENN Token IST-Funktion: 
        else if(v.typ === "Funktion") {
            //Token ZU Stack.
            speicherStapel.push(v);
        } 
        //WENN Token IST-Argumenttrennzeichen:
        else if(v.typ === "Funktionsargument Trennzeichen") {
            //BIS Stack-Spitze IST öffnende-Klammer: 
            while(speicherStapel.letzterEintrag() && speicherStapel.letzterEintrag().typ !== "Linke Klammer") {
                //Stack-Spitze ZU Ausgabe.
                ausgabeStapel.addKnoten(speicherStapel.pop());
            }
            //FEHLER-BEI Stack IST-LEER:
            //  GRUND (1) Ein falsch platziertes Argumenttrennzeichen.
            //  GRUND (2) Der schließenden Klammer geht keine öffnende voraus.
            //ENDEFEHLER
        } 
        //WENN Token IST-Operator
        else if(v.typ == "Operator") {
            //SOLANGE Stack IST-NICHT-LEER UND Stack-Spitze IST Operator UND Token IST-linksassoziativ 
            //UND Präzedenz von Token IST-KLEINER Präzedenz von Stack-Spitze
            while (speicherStapel.letzterEintrag() 
                    && (speicherStapel.letzterEintrag().typ === "Operator") 
                    && (v.operatorAssoziativitaet() === "links")
                    && (v.operatorRangfolge() < speicherStapel.letzterEintrag().operatorRangfolge())
                    ) 
                {
                //Stack-Spitze ZU Ausgabe.
                ausgabeStapel.addKnoten(speicherStapel.pop());
            }
            //Token ZU Stack.
            speicherStapel.push(v);
        } 
        
        //WENN Token IST öffnende-Klammer:
        else if(v.typ === "Linke Klammer") {
            //Token ZU Stack.
            speicherStapel.push(v);
        }
        //WENN Token IST schließende-Klammer:
        else if(v.typ === "Rechte Klammer") {
            //BIS Stack-Spitze IST öffnende-Klammer:
            while(speicherStapel.letzterEintrag() && speicherStapel.letzterEintrag().typ !== "Linke Klammer") {
                //FEHLER-BEI Stack IST-LEER:
                //  GRUND (1) Der schließenden Klammer geht keine öffnende voraus.
                // ENDEFEHLER               
                
                //Stack-Spitze ZU Ausgabe.
                ausgabeStapel.addKnoten(speicherStapel.pop());
            }

            //Stack-Spitze (öffnende-Klammer) entfernen
            speicherStapel.pop();

            //WENN Stack-Spitze IST-Funktion:
            if(speicherStapel.letzterEintrag() && speicherStapel.letzterEintrag().typ === "Funktion") {
                //Stack-Spitze ZU Ausgabe.
                ausgabeStapel.addKnoten(speicherStapel.pop());
            }
        }
    });

    //BIS Stack IST-LEER:
    while(speicherStapel.letzterEintrag()) {
        //FEHLER-BEI Stack-Spitze IST öffnende-Klammer:
        //  GRUND (1) Es gibt mehr öffnende als schließende Klammern.
        //ENDEFEHLER        
        
        //Stack-Spitze ZU Ausgabe.
        ausgabeStapel.addKnoten(speicherStapel.pop());
    }
    
    //gib den letzten Eintrag in ausgabeStapel als Wurzel des Abstrakten-Syntax-Baums zurueck
    return ausgabeStapel.pop();
}