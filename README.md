# Employee Management System (EMS) - Aufgabenverteilung

## Projekt: HiTec GmbH Employee Management Frontend

---

## 👥 Teammitglieder & Aufgabenverteilung

### **Hammagi, Marouane**
**Bereich:** Authentifizierung & Dashboard

#### Wireframes: 2
1. Login-Seite (Anmeldeseite)
2. Dashboard/Startseite (nach Login)

#### Implementierung:
- Anmeldedaten eingeben können (Login-Formular)
- Erfolgreich authentifiziert erkennen (Feedback nach Login)
- Abmelden können (Logout-Button)
- JWT-Token-Verwaltung
- Geschützte Routen (Protected Routes)
- Sitzungsverwaltung
- Fehlerbehandlung bei Login-Fehlern

#### Anforderungen:
**Nutzungsanforderungen:** #1, #2, #3

---

### **Kunkel, Leon**
**Bereich:** Navigation & Mitarbeiterliste mit Filter

#### Wireframes: 2
1. Navigation/Header-Komponente (auf allen Seiten sichtbar) (Umsetzung durch Yassir und Marouane aufgrund zeitlicher Anforderungen für die morgigen Usability-Tests; ursprünglich diesem Aufgabenbereich zugeordnet)
2. Mitarbeiterübersichtsseite mit Filteroptionen

#### Implementierung:
- Globale Navigationskomponente mit Logout
- Alle Mitarbeiter anzeigen (Liste/Tabelle)
- Mitarbeiter nach Nachname filtern können
- Mitarbeiter nach Vorname filtern können
- Mitarbeiter nach Ort filtern können
- Mitarbeiter nach Qualifikationen filtern können
- Link zu Mitarbeiter-Details
- Link zu "Mitarbeiter hinzufügen"

#### Anforderungen:
**Nutzungsanforderungen:** #11, #14

---

### **Uzebe, Chukwuemeka**
**Bereich:** Mitarbeiter-CRUD & Details

#### Wireframes: 2
1. Mitarbeiter hinzufügen/bearbeiten Formular
2. Mitarbeiter-Detailseite

#### Implementierung:
- Neue Mitarbeiterdaten eingeben können (Formular)
- Bestehende Mitarbeiterdaten bearbeiten können (Formular)
- Mitarbeiterdaten löschen können (Löschen-Button)
- Daten und Qualifikationen eines Mitarbeiters einsehen (Detailansicht)
- Formularvalidierung
- Fehlermeldungen bei Fehleingaben anzeigen
- Erfolgs-/Fehlermeldungen nach Speichern/Löschen

#### Anforderungen:
**Nutzungsanforderungen:** #4, #5, #6, #13, #15

---

### **Elkhaili, Yassir** 
**Bereich:** Qualifikationsverwaltung & Zuweisung + Projektorganisation

#### Wireframes: 2
1. Qualifikationsübersichtsseite
2. Qualifikation hinzufügen/bearbeiten/löschen/anzeigen Formular

#### Implementierung:
- Alle aktuell relevanten Qualifikationen einsehen können (Liste)
- Neue Qualifikationen erfassen können (Formular)
- Veraltete Qualifikationen löschen können (Löschen-Button)
- Qualifikationen zu Mitarbeitern hinzufügen können
- Qualifikationen von Mitarbeitern entfernen können
- Qualifikationen nach Bezeichnung filtern können
- Formularvalidierung
- Fehlermeldungen bei Fehleingaben anzeigen

#### Zusätzliche Erledigte Aufgaben:
- Projektorganisation
- Figma-Organisation
- Repository-Setup (GitHub und Initial-Projekt einrichten)
- Aufgabenverteilung erstellen (dieses Dokument)
- Team-Koordination

#### Anforderungen:
**Nutzungsanforderungen:** #7, #8, #9, #10, #12, #15

---

## 📊 Zusammenfassung der Verteilung

| Teammitglieder     | Implementierungs-Aufgaben | Nutzungsanforderungen     |
|--------------------|---------------------------|---------------------------|
| Hammagi, Marouane  | 7                         | #1, #2, #3                |
| Kunkel, Leon       | 8                         | #11, #14                  |
| Uzebe, Chukwuemeka | 7                         | #4, #5, #6, #13, #15      |
| Elkhaili, Yassir   | 8 + Organisation          | #7, #8, #9, #10, #12, #15 |

---

## 📋 Nutzungsanforderungen (Referenz)

1. Der Benutzer muss am System Anmeldedaten eingeben können
2. Der Benutzer muss am System erkennen können, ob er erfolgreich authentifiziert wurde
3. Der Benutzer muss am System die Möglichkeit haben, sich abzumelden
4. Der Benutzer muss am System neue Mitarbeiterdaten eingeben können
5. Der Benutzer muss am System bestehende Mitarbeiterdaten bearbeiten können
6. Der Benutzer muss am System Mitarbeiterdaten löschen können
7. Der Benutzer muss am System alle aktuell relevanten Qualifikationen einsehen können
8. Der Benutzer muss am System neue Qualifikationen erfassen und veraltete löschen können
9. Der Benutzer muss am System Qualifikationen zu Mitarbeitern hinzufügen können
10. Der Benutzer muss am System Qualifikationen von Mitarbeitern entfernen können
11. Der Benutzer muss am System Mitarbeiter nach ihren Nachnamen, Vornamen, Ort und ihren Qualifikationen filtern können
12. Der Benutzer muss am System Qualifikationen nach ihren Bezeichnungen filtern können
13. Der Benutzer muss am System die Daten und insbesondere Qualifikationen eines Mitarbeiters einsehen können
14. Der Benutzer muss am System alle Mitarbeiter einsehen können
15. Der Benutzer muss durch geeignete Fehlermeldungen über Fehleingaben informiert werden

---

**Erstellt von:** Elkhaili, Yassir  
**Datum:** 07/01/2026  
**Projekt:** HiTec GmbH Employee Management System Frontend