# User stories – Mina citat

## Mål

En inloggad användare ska kunna samla, hantera och läsa sina favoritcitat på mobil och dator. Citat är privata: en användare kan aldrig se eller ändra någon annans citat.

## MVP-backlogg

### US-01 – Registrera konto

**Som ny användare vill jag registrera ett konto så att mina citat kan sparas privat.**

- E-post och lösenord krävs.
- E-post får bara registreras en gång.
- Lösenordet lagras endast som en säker hash.
- Ett lyckat svar innehåller en åtkomsttoken.

### US-02 – Logga in och ut

**Som användare vill jag kunna logga in och ut så att bara jag når mina citat.**

- Korrekt e-post/lösenord ger en JWT.
- Felaktiga uppgifter ger inget token och ett begripligt fel.
- Klienten skickar token som `Authorization: Bearer <token>`.
- Vid utloggning tas token bort från klienten och skyddade vyer kan inte längre öppnas.

### US-03 – Se Mina citat

**Som inloggad användare vill jag se min lista med citat så att jag enkelt hittar mina favoriter.**

- Sidan `/mina-citat` är skyddad av en route guard.
- Endast den aktuella användarens citat visas.
- Tom lista visar en uppmaning att lägga till första citatet.
- Layouten fungerar från 320 px bredd och uppåt.

### US-04 – Lägga till citat

**Som inloggad användare vill jag lägga till ett citat med författare så att jag kan spara det.**

- Citattext krävs och får vara högst 1 000 tecken.
- Författare är valfri och får vara högst 200 tecken.
- Sparat citat visas direkt i listan.

### US-05 – Redigera citat

**Som ägare av ett citat vill jag kunna ändra det så att samlingen hålls korrekt.**

- Redigering är förfylld med befintliga värden.
- Samma validering gäller som vid skapande.
- API:t avvisar försök att ändra någon annans citat.

### US-06 – Ta bort citat

**Som ägare av ett citat vill jag kunna ta bort det så att jag kan rensa i samlingen.**

- Användaren bekräftar borttagningen.
- Citatet tas bort från listan efter lyckat svar.
- API:t returnerar inte information om andra användares resurser.

## Definition of done

- Responsiv Bootstrap-layout och Font Awesome-ikoner används.
- Klient- och servervalidering finns för alla formulärfält.
- Skyddade API-endpoints kräver en giltig JWT.
- Grundflödena registrering, inloggning och CRUD är manuellt verifierade.
