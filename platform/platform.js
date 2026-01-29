fetch('platform/games.json')
  .then(response => response.json())
  .then(games => {
    const container = document.getElementById('games-list');
    container.innerHTML = '';

    games.forEach(game => {
      const card = document.createElement('a');
      // Use relative path from current location (works both locally and on GitHub Pages)
      card.href = game.path;
      card.className = 'game-card';
      card.dir = 'rtl'; // Support Hebrew titles naturally

      if (game.image) {
        const img = document.createElement('img');
        img.src = game.image;
        img.className = 'game-thumbnail';
        card.appendChild(img);
      }

      const title = document.createElement('div');
      title.className = 'game-title';
      title.textContent = game.title;
      card.appendChild(title);

      if (game.description) {
        const desc = document.createElement('span');
        desc.className = 'game-description';
        desc.textContent = game.description;
        card.appendChild(desc);
      }

      container.appendChild(card);
    });
  })
  .catch(error => {
    const container = document.getElementById('games-list');
    container.textContent = 'Failed to load games.';
    console.error(error);
  });
