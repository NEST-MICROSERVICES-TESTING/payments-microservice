import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { envs } from '../config/envs';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {

    private readonly stripe = new Stripe( envs.stripeSecret );

    async createPaymentSession( paymentSessionDto: PaymentSessionDto ){

        const { sCurrency, aItems, nIdOrder } = paymentSessionDto;

        const lineItems = aItems.map( item => {
            return {
                price_data: {
                    currency: sCurrency
                    ,product_data: {
                        name: item.sName
                    }
                    ,unit_amount: Math.round( item.nPrice * 100 ) // 20 Dólares
                }
                ,quantity: item.nQuantity
            }
        });

        const session = await this.stripe.checkout.sessions.create({
            // Colocar aquí el id de mi orden
            payment_intent_data: {
                metadata: {
                    nIdOrder: nIdOrder
                }
            }
            ,line_items : lineItems
            ,mode       : 'payment'
            ,success_url: envs.stripeSuccessUrl
            ,cancel_url : envs.stripeCancelUrl
        });

        return session;
    }

    async stripeWebhook( req: Request, res: Response ){
        const signature = req.headers['stripe-signature'];
        
        let event: Stripe.Event;
        const endpointSecret = envs.stripeEndpointSecret; //'whsec_qP1dgGm7hCaGxTB9gSQTIOWUvKMFKWVh'; // REAL

        try {
            event = this.stripe.webhooks.constructEvent( req['rawBody'], signature!, endpointSecret );
        } catch (error) {
            res.sendStatus(400).send(`Webhook Error: ${ error.message }`);
            return;
        }
        console.log({event});
        switch ( event.type ) {
            case 'charge.succeeded':
                const chargeSucceeded = event.data.object;
                // TODO: llamar a nuestro microservicio
                console.log( {
                    metadata: chargeSucceeded.metadata
                } );
            break;

            default:
                console.log( `Evento ${ event.type } not handled` )
        }
        return res.status(200).json({ signature });
    }
}
