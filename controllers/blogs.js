const Blog = require('../models/blog')
const User = require('../models/user')
const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1, adult: 1 })
  response.json(blogs.map(Blog.format))
})

blogsRouter.get('/:id', async (request, response) => {
  try {
    const blog = await Blog.findById(request.params.id)
    if (blog) return response.json(Blog.format(blog))
    else return response.status(404).end()
  } catch (exception) {
    response.status(400).send({ error: 'malformatted id' })
  }
})

blogsRouter.post('/', async (request, response) => {
  try {
    const token = request.token
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) return response.status(401).json({ error: 'token missing or invalid' })

    const body = request.body
    if (!body.title || !body.url) return response.status(400).end()

    const user = await User.findById(decodedToken.id)

    const blog = new Blog({
      ...body,
      likes: body.likes || 0,
      user: user._id
    })

    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(blog._id)
    await user.save()

    response.status(201).json(Blog.format(savedBlog))
  } catch (exception) {
    if (exception.name === 'JsonWebTokenError' ) {
      response.status(401).json({ error: exception.message })
    } else {
      console.log(exception)
      response.status(500).json({ error: 'something went wrong...' })
    }
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  try {
    const token = request.token
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) return response.status(401).json({ error: 'token missing or invalid' })

    const blog = await Blog.findById(request.params.id)
    if (!blog) return response.status(404).end()

    if (blog.user.toString() !== decodedToken.id) return response.status(403).json({ error: 'you do not have permission' })

    await blog.remove()
    response.status(204).end()
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