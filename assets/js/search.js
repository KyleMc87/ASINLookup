const searchBtn = document.querySelector('.amz-search');
const searchInput = document.querySelector('.amz-input');
const errorPane = document.querySelector('.amz-search-err');
const resultPane = document.querySelector('.amz-search-result');
const errorText = document.querySelector('.amz-search-err-reason');
const resultCategory = document.querySelector('.amz-category');
const resultDimensions = document.querySelector('.amz-dimensions');
const resultWeight = document.querySelector('.amz-weight');
const resultRank = document.querySelector('.amz-rank');

searchBtn.addEventListener('click', () => {
  const itemRequest = new Request('item/' + searchInput.value);
  fetch(itemRequest).then(response => {
    response.json().then(data => {
      if (data.error) {
        showError(data.error);
      } else {
        showResults(data);
      }
    }).catch(() => {
      showError();
    });
  });
});

function showError(error){
  errorPane.classList.remove('hidden');
  resultPane.classList.add('hidden');
  errorText.innerHTML = error;
}

function showResults(data){
  resultPane.classList.remove('hidden');
  errorPane.classList.add('hidden');
  resultCategory.innerHTML = data.categories.join(' > ');
  resultDimensions.innerHTML = data.details.dimensions;
  resultWeight.innerHTML = data.details.weight;
  resultRank.innerHTML = data.seller.ranks;
}

