/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51NHiNVSH1XMCsxhfiWIYTIp8BxYhPLidIHEjd6pugwaCITdivyD4O3DgaRoX2K5BSObmatOoLMlLIYzOGAHdHP2500I7gbOTjT'
);

export const bookTour = async (tourId) => {
  try {
    // 1 Get session from server
    const response = await axios(
      `/api/v1/bookings/checkout-session/${tourId}`
    );

    // 2 Create checkout form and charge credit card
    await stripe.redirectToCheckout({
      sessionId: response.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
