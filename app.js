// Function to handle form submission
document.getElementById('cardForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const imgSrc = document.getElementById('imgSrc').value;
    const imgAlt = document.getElementById('imgAlt').value;
    const imgWidth = document.getElementById('imgWidth').value;
    const imgHeight = document.getElementById('imgHeight').value;
    const description = document.getElementById('description').value;

    const cardData = {
        imgSrc: imgSrc,
        imgAlt: imgAlt,
        imgWidth: imgWidth,
        imgHeight: imgHeight,
        description: description
    };

    const cardHTML = generateCardHTML(cardData);

    document.getElementById('cardsContainer').innerHTML += cardHTML;

    this.reset();
});

function generateCardHTML(cardData) {
    return `
    <hr>
        <div class="card">
            <main class="card-content">
                <img src="${cardData.imgSrc}" alt="${cardData.imgAlt}" width="${cardData.imgWidth}" height="${cardData.imgHeight}">
                <p>${cardData.description}</p>
            </main>
        </div>
        <h3 class="question">Do you want to post it?</h3>
        <button class="continue-editing">Continue Editing</button> <button class="post">Would like to post</button>
    `;
}
