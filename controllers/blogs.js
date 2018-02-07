const Blog = require('../models/blog')
const User = require('../models/user')
const blogsRouter = require('express').Router()

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1, adult: 1 })
  response.json(blogs.map(Blog.format))
})

blogsRouter.get('/:id', async (request, response) => {
  try {
    const blog = await Blog.findById(request.params.id)
    if (blog) return response.json(blog)
    else return response.status(404).end()
  } catch (exception) {
    response.status(400).send({ error: 'malformatted id' })
  }
})

blogsRouter.post('/', async (request, response) => {
  try {
    const body = request.body
    if (!body.title || !body.url) return response.status(400).end()
    const users = await User.find({})

    const blog = new Blog({
      ...body,
      likes: body.likes || 0,
      user: users[0]._id
    })

    const savedBlog = await blog.save()
    response.status(201).json(savedBlog)
  } catch (exception) {
    console.log(exception)
    response.status(400)
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  try {
    const blog = await Blog.findByIdAndRemove(request.params.id)
    if (blog) return response.status(204).end()
    else return response.status(404).end()
  } catch (exception) {
    console.log(exception)
    response.status(400).send({ error: 'malformatted id' })
  }
})

blogsRouter.put('/:id', async (request, response) => {
  try {
    const body = request.body
    const blog = await Blog.findByIdAndUpdate(request.params.id, body, { new: true })
    if (blog) return response.json(blog)
    else return response.status(404).end()
  } catch (exception) {
    console.log(exception)
    response.status(400)
  }
})

module.exports = blogsRouter