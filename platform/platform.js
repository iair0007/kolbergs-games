fetch('platform/games.json')
  .then(response => response.json())
  .then(games => {
    const container = document.getElementById('games-list');
    container.innerHTML = '';

    games.forEach(game => {
      const card = document.createElement('a');
      card.href = game.path;
      card.className = 'game-card';

      card.textContent = game.title;

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
