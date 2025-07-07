    document.querySelectorAll('.time-tab').forEach(tab => {
      tab.addEventListener('click', function() {
        document.querySelectorAll('.time-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        const range = this.dataset.range;
        const monthYearFilters = document.querySelector('.month-year-filters');
        
        if (range === 'recent') {
          monthYearFilters.style.display = 'none';
          document.querySelector('.transactions-section').style.display = 'block';
          document.querySelector('.filtered-results').style.display = 'none';
        } else {
          monthYearFilters.style.display = 'grid';
        }
      });
    });

    document.getElementById('reset-filter').addEventListener('click', function() {
      document.querySelector('.time-tab[data-range="recent"]').click();
    });
