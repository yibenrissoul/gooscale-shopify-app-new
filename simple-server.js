const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Serve the login page HTML
  res.writeHead(200, { 'Content-Type': 'text/html' });
  
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gooscale App Preview</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f6f6f7;
      }
      .container {
        max-width: 800px;
        margin: 40px auto;
        padding: 20px;
      }
      .card {
        background: white;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0,0,0,0.05);
        padding: 24px;
        margin-bottom: 24px;
      }
      .logo {
        text-align: center;
        margin-bottom: 16px;
      }
      .logo img {
        max-width: 180px;
        margin: 0 auto;
      }
      h1, h2 {
        color: #212b36;
        text-align: center;
      }
      p {
        color: #637381;
        text-align: center;
        margin-bottom: 24px;
      }
      .form-group {
        margin-bottom: 16px;
      }
      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #212b36;
      }
      input {
        width: 100%;
        padding: 12px;
        border: 1px solid #c4cdd5;
        border-radius: 4px;
        box-sizing: border-box;
        font-size: 16px;
      }
      .help-text {
        font-size: 14px;
        color: #637381;
        margin-top: 4px;
      }
      button {
        background-color: #5f0392;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 4px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        width: 100%;
        margin-top: 16px;
      }
      button:hover {
        background-color: #4b0273;
      }
      ul {
        padding-left: 24px;
      }
      li {
        margin-bottom: 12px;
        color: #212b36;
      }
      .banner {
        background-color: #f4f6f8;
        border-left: 4px solid #5f0392;
        padding: 16px;
        margin-top: 24px;
        border-radius: 4px;
      }
      .banner-title {
        font-weight: 600;
        margin-bottom: 8px;
      }
      .banner-action {
        display: inline-block;
        color: #5f0392;
        text-decoration: none;
        margin-top: 8px;
        font-weight: 500;
      }
      .banner-action:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <div class="logo">
          <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTgwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0zMC4yIDEyLjRDMzAuMiA1LjYgMjQuOCAwLjIgMTggMC4yQzExLjIgMC4yIDUuOCA1LjYgNS44IDEyLjRDNS44IDE5LjIgMTEuMiAyNC42IDE4IDI0LjZDMjQuOCAyNC42IDMwLjIgMTkuMiAzMC4yIDEyLjRaIiBmaWxsPSIjNWYwMzkyIi8+PHBhdGggZD0iTTQ4LjIgMTIuNEM0OC4yIDUuNiA0Mi44IDAuMiAzNiAwLjJDMjkuMiAwLjIgMjMuOCA1LjYgMjMuOCAxMi40QzIzLjggMTkuMiAyOS4yIDI0LjYgMzYgMjQuNkM0Mi44IDI0LjYgNDguMiAxOS4yIDQ4LjIgMTIuNFoiIGZpbGw9IiM1ZjAzOTIiLz48cGF0aCBkPSJNNjYuMiAxMi40QzY2LjIgNS42IDYwLjggMC4yIDU0IDAuMkM0Ny4yIDAuMiA0MS44IDUuNiA0MS44IDEyLjRDNDEuOCAxOS4yIDQ3LjIgMjQuNiA1NCAyNC42QzYwLjggMjQuNiA2Ni4yIDE5LjIgNjYuMiAxMi40WiIgZmlsbD0iIzVmMDM5MiIvPjxwYXRoIGQ9Ik03NC4yIDI4LjRDNzQuMiAyMS42IDY4LjggMTYuMiA2MiAxNi4yQzU1LjIgMTYuMiA0OS44IDIxLjYgNDkuOCAyOC40QzQ5LjggMzUuMiA1NS4yIDQwLjYgNjIgNDAuNkM2OC44IDQwLjYgNzQuMiAzNS4yIDc0LjIgMjguNFoiIGZpbGw9IiM1ZjAzOTIiLz48cGF0aCBkPSJNOTIuMiAyOC40QzkyLjIgMjEuNiA4Ni44IDE2LjIgODAgMTYuMkM3My4yIDE2LjIgNjcuOCAyMS42IDY3LjggMjguNEM2Ny44IDM1LjIgNzMuMiA0MC42IDgwIDQwLjZDODYuOCA0MC42IDkyLjIgMzUuMiA5Mi4yIDI4LjRaIiBmaWxsPSIjNWYwMzkyIi8+PHBhdGggZD0iTTExMC4yIDI4LjRDMTEwLjIgMjEuNiAxMDQuOCAxNi4yIDk4IDE2LjJDOTEuMiAxNi4yIDg1LjggMjEuNiA4NS44IDI4LjRDODUuOCAzNS4yIDkxLjIgNDAuNiA5OCA0MC42QzEwNC44IDQwLjYgMTEwLjIgMzUuMiAxMTAuMiAyOC40WiIgZmlsbD0iIzVmMDM5MiIvPjx0ZXh0IHg9IjEyMCIgeT0iMzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzVmMDM5MiI+R29vc2NhbGU8L3RleHQ+PC9zdmc+" alt="Gooscale Logo">
        </div>
        <h2>Connect your Shopify store to Gooscale</h2>
        <p>Simplify multi-market management and boost your global e-commerce operations</p>
        
        <form>
          <div class="form-group">
            <label for="shop">Shop domain</label>
            <input type="text" id="shop" name="shop" placeholder="your-shop.myshopify.com">
            <div class="help-text">e.g: your-shop.myshopify.com</div>
          </div>
          <button type="submit">Log in with Shopify</button>
        </form>
      </div>
      
      <div class="card">
        <h2>Why connect to Gooscale?</h2>
        <ul>
          <li><strong>Centralized Management:</strong> Manage multiple markets and storefronts from a single dashboard</li>
          <li><strong>Multilingual Support:</strong> Create and manage content in multiple languages to reach global customers</li>
          <li><strong>Streamlined Operations:</strong> Simplify inventory, pricing, and order management across all your markets</li>
        </ul>
        
        <div class="banner">
          <div class="banner-title">Already have a Gooscale account?</div>
          <p>Access your full Gooscale dashboard to manage all your connected stores and markets.</p>
          <a href="https://partners-staging.gooscale.com/auth/login" class="banner-action">Go to main platform</a>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
  
  res.end(html);
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
