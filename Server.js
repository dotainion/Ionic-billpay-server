const stripe = require("stripe")("sk_test_51HMQLOBZvIBjqI0E93lQVGdltBSy5P0uqkUA5gUFNBbQdkexXdEzoSSFG26FiqbR8g8QUiHXOhLH1VlWcU6qHRt2005AyPPFDS");
const bodyParser = require('body-parser');
const uuid = require("uuid/v4");
const express = require("express");

const cors = require("cors");
const app = express();

app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

app.post("/", (req, res) => {
    console.log("geting a test data")
    res.send("Add your Stripe Secret Key to the .require('stripe') statement!");
});

app.post("/checkout", async (req, res) => {
    let error;
    let status;
    try {
    const { product, token } = req.body;

        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id
        });

        const idempotencyKey = uuid();
        const charge = await stripe.charges.create(
            {
                amount: product.price * 100,
                currency: "usd",
                customer: customer.id,
                receipt_email: token.email,
                description: `Purchased the ${product.name}`,
                shipping: {
                    name: token.card.name,
                    address: {
                        line1: token.card.address_line1,
                        line2: token.card.address_line2,
                        city: token.card.address_city,
                        country: token.card.address_country,
                        postal_code: token.card.address_zip
                    }
                }
            },
            {
                idempotencyKey
            }
        );
        status = "success";
    } catch (error) {
        console.error("Error:");
        status = "failure";
    }finally{
        res.json({ error, status });
    }
});

app.listen(4242, ()=>{console.log("listening on 4242")});
