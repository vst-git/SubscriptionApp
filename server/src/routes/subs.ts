import express from 'express';
import User from '../models/user';
import Article from '../models/article';
import { checkAuth } from '../middleware/checkAuth';
import stripe from '../utils/stripe';

const router = express.Router();

router.get('/prices', checkAuth, async (req, res) => {
  const prices = await stripe.prices.list({
    apiKey: process.env.STRIPE_SECRET_KEY,
  });

  return res.json(prices);
});

router.post('/session', checkAuth, async (req, res) => {
  const user = await User.findOne({ email: req.user });

  Article.create({
    title: 'Best tricks of photography',
    imageUrl:
      'https://images.unsplash.com/photo-1680402172128-c82200fe4ff5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw5fHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=500&q=60',
    content:
      'It seems obvious, but the greatest trick to improving your photography skills is to practice them. All of the great photographers weren’t born that way. They had a great eye naturally, yes, but they also took time to learn their craft. You can too.',
    access: 'Basic',
  });

  Article.create({
    title: 'Puzzle solving ideas',
    imageUrl:
      'https://plus.unsplash.com/premium_photo-1678308063696-d7edda27f424?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw3NXx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=60',
    content:
      'Our brains work through connections, and puzzles strengthen our ability to make links, see patterns, and piece things together.',
    access: 'Standard',
  });

  Article.create({
    title: 'Why not to smoke',
    imageUrl:
      'https://images.unsplash.com/photo-1680252111945-c80eabc8e191?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw4NXx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=60',
    content:
      'Smoking damages nearly every organ in the body and is bad for a person’s overall health. People can significantly reduce their chance of smoking-related disease by giving it up.',
    access: 'Premium',
  });

  const session = await stripe.checkout.sessions.create(
    {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: req.body.priceId,
          quantity: 1,
        },
      ],
      success_url: 'http://localhost:3000/articles',
      cancel_url: 'http://localhost:3000/article-plans',
      customer: user?.stripeCustomerId,
    },
    {
      apiKey: process.env.STRIPE_SECRET_KEY,
    }
  );

  return res.json(session);
});

export default router;
