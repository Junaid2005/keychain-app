export function getAudioCatalogue() {
    const imageUrlOptions = ['/file.svg', '/globe.svg', '/next.svg', '/vercel.svg', '/window.svg']

    // const randomNumber = Math.floor(Math.random() * (100 - 3 + 1)) + 3;
    const randomNumber = 80;

    const audioItems = []
    // Sample data for the grid (replace with your actual audio metadata)
    for (let i = 1; i < randomNumber; i++) {
        audioItems.push({ id: i, title: `Track ${i}`, artist: `Artist ${Math.floor(i/10)}`, imageUrl: imageUrlOptions[Math.floor(Math.random() * imageUrlOptions.length)] },)
    }

    return audioItems
}