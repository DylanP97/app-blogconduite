// stripe
// const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)
// const storeItems = new Map([
//   [1, { priceInCents: 900, name: 'Accès Apprentissage Conduite Alexandre'}],
//   [2, { priceInCents: 2000, name: 'Produit 2'}],
// ])
// app.post('/create-checkout-session', async (req, res) => {
//   try {
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       mode: 'payment',
//       line_items: req.body.items.map(item => {
//         const storeItem = storeItems.get(item.id)
//         return {
//           price_data: {
//             currency: 'eur',
//             product_data: {
//                 name: storeItem.name
//             },
//             unit_amount: storeItem.priceInCents
//           },
//           quantity: item.quantity
//         }
//       }),
//       success_url: `${process.env.FRONTEND_URL}/inscription`,
//       cancel_url:`${process.env.FRONTEND_URL}/inscription`,
//     })
//   res.json({ url: session.url })


//   } catch (e) {
//       res.status(500).json({ error: e.message })
//   }

// })

module.exports = router;