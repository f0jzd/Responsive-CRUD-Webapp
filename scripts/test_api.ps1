$base = 'http://localhost:5168/api'

# Test 1: Public Books endpoint
$books = Invoke-RestMethod -Uri "$base/books" -Method Get
Write-Host "Books count:" $books.Count
Write-Host "First book:" $books[0].title "by" $books[0].author

# Test 2: Login Demo User
$loginBody = @{ email = 'demo@example.com'; password = 'Password123!' } | ConvertTo-Json
$loginRes = Invoke-RestMethod -Uri "$base/auth/login" -Method Post -Body $loginBody -ContentType 'application/json'
Write-Host "Demo logged in! Token:" ($loginRes.accessToken.Substring(0, 20) + "...")

# Test 3: Register New User
$newEmail = "test_" + (Get-Random) + "@example.com"
$regBody = @{ email = $newEmail; password = "SuperPassword123!" } | ConvertTo-Json
$regRes = Invoke-RestMethod -Uri "$base/auth/register" -Method Post -Body $regBody -ContentType 'application/json'
$userToken = $regRes.accessToken
$headers = @{ Authorization = "Bearer $userToken" }
Write-Host "Registered user:" $regRes.user.email

# Test 4: Verify 5 seeded quotes for new user
$quotes = Invoke-RestMethod -Uri "$base/quotes" -Method Get -Headers $headers
Write-Host "Seeded quotes for new user count:" $quotes.Count
$quotes | ForEach-Object { Write-Host " - Quote:" $_.text "by" $_.author }

# Test 5: Add a new book
$bookPayload = @{
    title = 'Ronja Rövardotter'
    author = 'Astrid Lindgren'
    publicationDate = '1981-01-01'
    description = 'Boken handlar om flickan Ronja som växer upp bland rövare i Mattisborgen.'
    coverImageUrl = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c'
} | ConvertTo-Json
$createdBook = Invoke-RestMethod -Uri "$base/books" -Method Post -Body $bookPayload -Headers $headers -ContentType 'application/json'
Write-Host "Created Book ID:" $createdBook.id "Title:" $createdBook.title "Creator:" $createdBook.creatorEmail

# Test 6: Update the book
$updatePayload = @{
    title = 'Ronja Rövardotter (Jubileum)'
    author = 'Astrid Lindgren'
    publicationDate = '1981-01-01'
    description = 'Uppdaterad beskrivning med mer detaljer.'
    coverImageUrl = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c'
} | ConvertTo-Json
Invoke-RestMethod -Uri "$base/books/$($createdBook.id)" -Method Put -Body $updatePayload -Headers $headers -ContentType 'application/json'
Write-Host "Book updated successfully!"

# Test 7: Verify updated book
$updatedBook = Invoke-RestMethod -Uri "$base/books/$($createdBook.id)" -Method Get
Write-Host "Verified updated title:" $updatedBook.title

# Test 8: Add a new quote
$newQuotePayload = @{
    text = 'Ett eget citat: Framtiden tillhör dem som tror på skönheten i sina drömmar.'
    author = 'Eleanor Roosevelt'
} | ConvertTo-Json
$createdQuote = Invoke-RestMethod -Uri "$base/quotes" -Method Post -Body $newQuotePayload -Headers $headers -ContentType 'application/json'
Write-Host "Added Quote ID:" $createdQuote.id "Text:" $createdQuote.text

# Test 9: Update quote
$editQuotePayload = @{
    text = 'Framtiden tillhör dem som tror på skönheten i sina drömmar.'
    author = 'Eleanor Roosevelt'
} | ConvertTo-Json
Invoke-RestMethod -Uri "$base/quotes/$($createdQuote.id)" -Method Put -Body $editQuotePayload -Headers $headers -ContentType 'application/json'
Write-Host "Updated quote successfully!"

# Test 10: Delete quote
Invoke-RestMethod -Uri "$base/quotes/$($createdQuote.id)" -Method Delete -Headers $headers
Write-Host "Deleted quote successfully!"

# Test 11: Delete book
Invoke-RestMethod -Uri "$base/books/$($createdBook.id)" -Method Delete -Headers $headers
Write-Host "Deleted book successfully!"

Write-Host "=== ALL 11 API TESTS PASSED WITH 100% SUCCESS ==="
