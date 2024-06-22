const express = require('express')
const crypto = require('node:crypto')
const movies = require('./movies.json')

const { validateMovie, validatePartialMovie } = require('./schemas/movies')
const app = express()
const PORT = process.env.PORT ?? 1234

const ACCEPTED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:3000',
  'http://localhost:1234'
]

app.use(express.json())
app.disable('x-powered-by') // ---> Deshabilitar el header X-Powered-By: Express

app.get('/', (req, res) => {
  console.log(req.url)
  res.status(201).json({ message: 'Hola mundo' })
})

// Todos los recursos que sean MOVIES se identifican con /movies
app.get('/movies', (req, res) => {
  const origin = req.header('origin')

  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
  }

  const { genre } = req.query
  if (genre) {
    const filteredMovies = movies.filter(
      movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )
    if (filteredMovies.length > 0) return res.json(filteredMovies)
    return res.json({ message: `No se encontraronn peliculas con el genero '${genre}' ` })
  }
  res.json(movies)
})

app.get('/movies/:id', (req, res) => { // path-to-regexp
  const { id } = req.params
  const movie = movies.find(movie =>
    movie.id === id
  )
  if (movie) return res.json(movie)

  res.status(404).json({ message: `Movie not found at id:${id}` })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (result.error) {
    res.status(400).json({ error: result.error.issues })
  }

  const newMovie = {
    id: crypto.randomUUID(), // --> Crea uuid v4 ID ÚNICO (universal unique identifier)
    ...result
  }

  // Esto NO SERÍA UNA API REST, porque estamos
  // guardando el estado de la aplicación en memoria
  movies.push(newMovie)

  res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)

  if (!result.success) {
    return res.status(400).json({ error: result.error.issues })
  }

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: `Not found any movie with id: ${id}` })
  }

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updateMovie

  return res.json(updateMovie)
})

app.delete('/movies/:id', (req, res) => {
  const origin = req.header('origin')

  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
  }

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: `Movie not found with id: ${id}` })
  }

  movies.splice(movieIndex, 1)

  return res.json({ message: 'Movie deleted' })
})

app.options('/movies/:id', (req, res) => {
  const origin = req.header('origin')

  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  }
  res.send(200)
})

app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`)
})
