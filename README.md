# YARA - Yet another recipe app

## Motivation

Meine Freundin und ich haben dass Problem dass wir öfters Rezepte auf Webseiten finden,
welche wir eigentlich gut finden, aber diese das nächste mal wieder zu finden stellt sich als schwierig heraus.
Wir speichern sie aktuell in einer WhatsApp Gruppe, aber das ist nicht wirklich praktisch.  
Daher habe ich mich entschieden eine kleine Webapp zu schreiben, in welcher wir Rezepte speichern können.

## Features

Die ursprüngliche Version soll nur die wichtigsten Features haben, welche wir benötigen:

- Erstellen von Rezepten
- Importieren von Rezepten aus dem Internet
- Anzeigen von Rezepten
- Suchen von Rezepten
- Gruppieren von Rezepten in Rezeptbüchern
- Teilen von Rezeptbüchern mit anderen Nutzern

## Technologien

Für das Backend war die Vorgabe, dass es in Python geschrieben sein soll.  
Deshalb habe ich mich für Django entschieden, da ich davon schon viel Gutes gehört habe.  
Da ich aber ein reaktiveres Frontend haben wollte, und nicht nur Serverseitiges Rendering nutzen wollte, habe ich mich
für Django Rest Framework entschieden, welches eine REST API für Django bereitstellt.  
Für das Frontend habe ich mich für Angular entschieden, da ich schon erste Erfahrungen damit gemacht habe, und es mir
gut gefällt.  
Als Datenbank habe ich mich für MariaDB entschieden, da ich den Server auf meinem Raspberry Pi laufen lassen möchte, und
es für MariaDB einen Docker Container gibt, welcher auf dem ARM Prozessoren läuft.  
Als Deployment Umgebung habe ich mich für einen Docker Compose Stack entschieden, da ich so die einzelnen Komponenten
einfach hochfahren kann, und es die Abgabe des Projektes vereinfacht.

## Installation

- Erstellen der .env Datei aus der .env.sample Datei
- Anpassen der .env Datei
- Ausführen von `docker-compose up -d`

## Datenmodell

Für die Nutzerverwaltung wird das Django User Model verwendet.  
Das Superuser Model wird in allen Endpoints unterstützt, und erlaubt das Umgehen der Berechtigungen.

Das Datenmodell besteht aus den folgenden Models:
![Datenmodell](./assets/data_model.png)

- recipebook:
    - title: Name des Rezeptbuchs
    - description: Kurze Beschreibung des Rezeptbuchs
- recipebookaccess: Verknüpfungstabelle zwischen Nutzern und Rezeptbüchern
    - access_level: "Read" oder "Full", gibt an ob der Nutzer nur lesen oder auch schreiben darf
    - recipebook_id: Fremdschlüssel auf das Rezeptbuch
    - user_id: Fremdschlüssel auf den Nutzer
- recipe:
    - title: Name des Rezepts
    - description: Kurze Beschreibung des Rezepts
    - recipebook_id: Fremdschlüssel auf das Rezeptbuch
    - image: Pfad zum Bild des Rezepts
- ingredient:
    - amount: Menge der Zutat
    - name: Name der Zutat
    - recipe_id: Fremdschlüssel auf das Rezept
- recipestep:
    - step_number: Nummer des Schritts
    - description: Beschreibung des Schritts
    - recipe_id: Fremdschlüssel auf das Rezept

Ingredient wurde in amount und name aufgeteilt, um es später zu ermöglich die Zutaten anhand der gewünschten Portionen
zu skalieren.  
Aktuell hat nur das Rezept ein Bild, obwohl es ursprünglich geplant war, dass auch das Rezeptbuch, die Ingredient und
die Schritte ein Bild haben, das hat aber zeitlich nicht mehr geklappt.

## Endpoints

### GET

- `recipeBooks/`

>

- `users/?page=1`
- `recipeBooks/${idParam}/`
- `recipeBooks/?write=true`
- `recipes/${this.activatedRoute.snapshot.params["id"]}/`
- `recipes/${this.existingRecipe.id}/`
- `recipeBooks/${data["id"]}/`
- `recipes/${data["id"]}/`
- `users/current/`

### POST

- `recipeBooks/`
- `recipes/`
- `processUrl/`
- `generateRecipeThumbnail/`
- `login/`
- `register/`

## Frontend

Für das Frontend wollte ich eine einfache und übersichtliche Oberfläche haben, welche sich auf die wichtigsten
Funktionen beschränkt.  
Dafür habe ich sehr an das Google Material 3 Design gehalten.
Jedoch wollte ich schon immer mal Tailwind CSS ausprobieren, und habe deswegen das Styling damit gemacht.

### Authentifizierung

Der Session Token welcher von Django Rest Framework verwendet wird, wird im LocalStorage gespeichert.
Dadurch ist es möglich, dass der Nutzer eingeloggt bleibt, auch wenn er die Seite schließt.
Der Token wird beim Login und beim Registrieren gesetzt, und beim Logout gelöscht.
Das Frontend nutzt folgende Komponenten für die Authentifizierung:

- `auth.service.ts`: Service welcher die Authentifizierung durchführt und token im LocalStorage speichert
- `auth.guard.ts`: Guard welcher bei Seitennavigation prüft ob ein Token vorhanden ist, und wenn nicht auf die Login
  Seite weiterleitet.
- `auth.interceptor.ts`: Interceptor welcher bei jeder HTTP Anfrage den Token im LocalStorage ausliest, und als
  Authorization Header hinzufügt. Außerdem wird bei einer 401 Antwort der Token gelöscht, und der Nutzer auf die Login
  Seite weitergeleitet.

### Error Handling

Das Frontend nutzt aktuell nur ein generisches Error Handling, welches bei jeder HTTP Anfrage prüft ob ein Django Error
zurückgegeben wurde, und diesen dann anzeigt.  
Hierfür werden folgende Komponenten verwendet:

- `error.interceptor.ts`: Interceptor welcher auf Status und Error Body prüft, und bei einem parsebaren Fehler diesen
  anzeigt.
- `notification.service.ts`: Service welcher Benachrichtigungen entgegennimmt, und diese anzeigt.
- `notification.component.ts`: Komponente welche oben rechts Benachrichtigungen als Toast anzeigt.

### Navigation Bar

Die App ist hauptsächlich für mobile Geräte gedacht, und hat deswegen eine Navigation bar am unteren Bildschirmrand.  
An dieser kann:

- Zur Startseite navigieren
- Sich ausloggen
- Ein neue Rezept erstellen
- Dummy Button

Damit Content nicht von der Navigation bar verdeckt wird, wird der Content um die Höhe der Navigation bar nach oben
verschoben und die Navigation bar hat einen verdeckenden Hintergrund welcher einen übergang zur Transparenz hat.

### Startseite

Auf der Startseite werden aktuell eine Liste aller Kochbücher angezeigt, auf welche der Nutzer Zugriff hat.  
Hier war eigentlich geplant, dass dem Nutzer rezepte vor geschlagen werden. Dies wurde aber noch nicht umgesetzt.

### Rezeptbuch

Die Rezeptbuch Seite zeigt alle Rezepte eines Rezeptbuchs an.  
Oben befindet sich eine Suchleiste, welche die Rezepte nach dem Titel filtert.
Rezepte haben eine Bildvorschau, den Titel und die Beschreibung.
Hat der Nutzer bearbeitungsrechte, kann er die Rezepte bearbeiten, und löschen.

### Rezept Erstellen

Die Rezepte erstellen Seite erlaubt es dem Nutzer ein neues Rezept zu erstellen oder zu importieren.
Oben kann der Nutzer eine URL zu einem Rezept eingeben, welches dann importiert wird und die anderen Felder automatisch
füllt.  
Alternativ kann der Nutzer auch ein Rezept manuell erstellen, und die Felder selbst ausfüllen.
Die Rezepte Schritte können per Drag and Drop sortiert werden.

### Rezept bearbeiten

Die Rezept bearbeiten Seite ist die gleiche wie die Rezept erstellen Seite, jedoch werden die Felder mit den Daten des
Rezepts gefüllt.

### Rezept anzeigen

Die Rezeptseite zeigt ein großes Bild des Rezepts. Darunter befindet sich die Beschreibung, die Zutaten und die Schritte.


## Integration von OpenAI
Mit diesem Projekt wollte ich mal eine Anbindung an eine KI ausprobieren.  
Hierfür habe ich in zwei Endpoints eine Anbindung an die OpenAI API eingebaut.  

Im Ordner promptTemplates befinden sich Texte welche an die AI Endpoints geschickt werden.
### Nachbearbeitung eines Importierten Rezepts
Für das importieren von Rezepten anhand einer Url nutze ich die Bibliothek `recipe-scrapers`.
Diese Bibliothek ist sehr gut, jedoch werden Zutaten nicht in "amount" und "name" aufgeteilt, sondern als ein einzelner String.  
Diesen String zu trennen ginge zwar auch mit regulären Ausdrücken, jedoch gibt es da viele Edge Cases.
Deshalb wird der String an OpenAI geschickt, und die AI soll den String in "amount" und "name" aufteilen.

### Generieren von Rezeptthumnails
Ich wollte auch Bildgenerierung ausprobieren, und habe deswegen einen Button auf der Rezept erstellen/ bearbeiten Seite eingebaut, welcher ein Rezeptthumnail generiert.
Hierfür wird die aktuelle JSON Repräsentation des Rezepts an 




