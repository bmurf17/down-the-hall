export const getGoogleBooks = async (title: string) => {
    const query = new URLSearchParams({
        q: title,
        fields: "items(volumeInfo/description,volumeInfo/title,volumeInfo/authors,volumeInfo/pageCount,volumeInfo/imageLinks/thumbnail,volumeInfo/categories)",
    });

    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?${query.toString()}`);

    if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
    }

    const data = await response.json();

    return data;
};