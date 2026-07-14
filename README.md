# Uncle Jeff's

Next.js storefront for Uncle Jeff's, powered by Shopify Storefront API for products and checkout.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Create `.env.local` locally and add the same values to Hostinger's Node.js app environment variables:

```env
SHOPIFY_STORE_DOMAIN=uncle-jeffs-2.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-public-storefront-access-token
NEXT_PUBLIC_FORMSPREE_URL=https://formspree.io/f/your-form-id
```

Do not commit `.env.local`.

## Hostinger Deployment

Use Hostinger hPanel:

1. Go to `Websites` -> `Add Website`.
2. Choose `Deploy Web App` / `Node.js Web App`.
3. Choose `Import Git Repository`.
4. Connect GitHub and select this repository.
5. Use Node.js `20.x`.
6. Use npm as the package manager.
7. Build command: `npm run build`.
8. Start command: `npm start`.
9. Add the environment variables above in Hostinger.
10. Deploy.

Hostinger's GitHub deployment will reinstall dependencies, run the build, and restart the app when redeploying from commits.
