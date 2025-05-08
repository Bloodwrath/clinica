fetch('header.html')
    .then(res => res.text())
    .then(html => { document.getElementById('header').innerHTML = html; })
    .then(() => import('./header.js'));
