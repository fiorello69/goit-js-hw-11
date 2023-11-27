import axios from 'axios';

export async function fetchImages(query, page) {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: '40875400-82e0c12a147ae8cf2b06b950f',
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: 40,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  }
}
