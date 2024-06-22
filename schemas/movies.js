const z = require('zod')

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movie title is required'
  }),
  year: z.number().int().positive().max(2024),
  director: z.string(),
  duration: z.number().positive().max(200),
  poster: z.string().url({
    message: 'Poster must be a valid URL'
  }).endsWith('.jpg' || '.png'),
  genre: z.array(
    z.enum(['Action', 'Drama', 'Crime', 'Adventure', 'Comedy', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi']),
    {
      required_error: 'Movies genre is required',
      invalid_type_error: 'Movies genre must be an array of enum Genre Type'
    }
  ),
  rate: z.number().min(0).max(10).optional()
})

function validateMovie (object) {
  return movieSchema.safeParse(object)
}

function validatePartialMovie (object) {
  return movieSchema.partial().safeParse(object)
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
