import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImages } from './pixabay-api.js';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');
const lightbox = new SimpleLightbox('.gallery a');
let currentPage = 1;

function createPhotoCard(image) {
  return `
    <div class="photo-card">
      <a href="${image.largeImageURL}" data-lightbox="gallery">
        <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy">
      </a>
      <div class="info">
        <p class="info-item"><b>Likes:</b> ${image.likes}</p>
        <p class="info-item"><b>Views:</b> ${image.views}</p>
        <p class="info-item"><b>Comments:</b> ${image.comments}</p>
        <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
      </div>
    </div>
  `;
}

function appendImagesToGallery(images) {
  const cardsHTML = images.hits.map(createPhotoCard).join('');
  gallery.insertAdjacentHTML('beforeend', cardsHTML);
  lightbox.refresh();
  loadMoreButton.style.display = 'block';
}

function handleErrors(error) {
  console.error('Error fetching images:', error);
  Notiflix.Notify.failure('Oops! Something went wrong. Please try again.');
}

async function loadMoreImages(query) {
  try {
    const response = await fetchImages(query, currentPage);
    const { hits, totalHits } = response;

    if (hits.length === 0) {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
      loadMoreButton.style.display = 'none';
    } else {
      appendImagesToGallery(response);
      currentPage++;
    }
  } catch (error) {
    handleErrors(error);
  }
}

form.addEventListener('submit', async function (event) {
  event.preventDefault();
  const searchQuery = event.target.searchQuery.value;

  if (searchQuery) {
    gallery.innerHTML = '';
    loadMoreButton.style.display = 'none';
    currentPage = 1;

    try {
      const response = await fetchImages(searchQuery, currentPage);
      const { hits, totalHits } = response;

      if (hits.length === 0) {
        Notiflix.Notify.info(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        appendImagesToGallery(response);
        currentPage++;
      }
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    } catch (error) {
      handleErrors(error);
    }
  }
});

loadMoreButton.addEventListener('click', function () {
  const searchQuery = form.searchQuery.value;
  if (searchQuery) {
    loadMoreImages(searchQuery);
  }
});

loadMoreButton.style.display = 'none';
