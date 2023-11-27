import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImages } from './pixabay-api.js';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const lightbox = new SimpleLightbox('.gallery a');
let currentPage = 1;
let loading = false;

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
}

function handleErrors(error) {
  console.error('Error fetching images:', error);
  Notiflix.Notify.failure('Oops! Something went wrong. Please try again.');
}

async function loadMoreImages(query) {
  try {
    loading = true;
    const response = await fetchImages(query, currentPage);
    const { hits } = response;

    if (hits.length === 0) {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    } else {
      appendImagesToGallery(response);
      currentPage++;
      // Calculează înălțimea unei cărți
      const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();

      // Calculează cât de mult să facem scroll în jos (de exemplu, 2 cărți înălțime)
      const scrollAmount = cardHeight * 1;

      // Face scroll fluid către partea de jos a galeriei
      window.scrollBy({
        top: scrollAmount,
        behavior: 'smooth',
      });
    }
  } catch (error) {
    handleErrors(error);
  } finally {
    loading = false;
  }
}

form.addEventListener('submit', async function (event) {
  event.preventDefault();
  const searchQuery = event.target.searchQuery.value;

  if (searchQuery) {
    gallery.innerHTML = '';
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
window.addEventListener('scroll', function () {
  if (loading) return;

  const scrollPosition = window.scrollY + window.innerHeight;
  const pageHeight = document.body.scrollHeight;

  if (scrollPosition >= pageHeight - 500) {
    const searchQuery = form.searchQuery.value;
    if (searchQuery) {
      loadMoreImages(searchQuery);
    }
  }
});
