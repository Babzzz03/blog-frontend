'use client';

import { useState, useEffect } from 'react';
import { Heart, CreditCard, Smartphone, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { paymentService } from '@/services/payment.service';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '');

const PAYSTACK_AMOUNTS = [500, 1000, 2000];
const STRIPE_AMOUNTS = [1, 2, 5];
const PaystackLogo = ({ className }: { className?: string }) => (
  <img 
    src="/assets/paystack.png" 
    alt="USDC" 
    className={cn(" group-hover:grayscale-0 transition-all duration-500 object-contain", className)} 
  />
);


const StripeLogo = ({ className }: { className?: string }) => (
  <img 
    src="/assets/stripe.png" 
    alt="USDC" 
    className={cn("group-hover:grayscale-0 transition-all duration-500 object-contain", className)} 
  />
);

function StripeForm({
  clientSecret,
  paymentIntentId,
  onSuccess,
  onCancel,
}: {
  clientSecret: string;
  paymentIntentId: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    });
    if (stripeError) {
      setError(stripeError.message || 'Payment failed');
      setLoading(false);
      return;
    }
    try {
      await paymentService.verifyStripe(paymentIntentId, 'tip');
      onSuccess();
    } catch {
      setError('Verification failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-muted-foreground">
        payment secured by Stripe
      </p>
      <PaymentElement />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="flex-1" disabled={loading || !stripe}>
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Pay Now
        </Button>
      </div>
    </form>
  );
}

interface TipButtonProps {
  postId: string;
  postTitle: string;
}

export default function TipButton({ postId, postTitle }: TipButtonProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'select' | 'email' | 'stripe-form' | 'success'>('select');
  const [gateway, setGateway] = useState<'paystack' | 'stripe'>('paystack');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [payerName, setPayerName] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stripeClientSecret, setStripeClientSecret] = useState('');
  const [stripeIntentId, setStripeIntentId] = useState('');

  const amounts = gateway === 'paystack' ? PAYSTACK_AMOUNTS : STRIPE_AMOUNTS;
  const currencySymbol = gateway === 'paystack' ? '₦' : '$';
  const finalAmount = selectedAmount ?? (customAmount ? Number(customAmount) : 0);

  useEffect(() => {
    if (!document.getElementById('paystack-script')) {
      const s = document.createElement('script');
      s.id = 'paystack-script';
      s.src = 'https://js.paystack.co/v1/inline.js';
      document.head.appendChild(s);
    }
  }, []);

  const reset = () => {
    setStep('select');
    setSelectedAmount(null);
    setCustomAmount('');
    setPayerName('');
    setPayerEmail('');
    setError('');
    setStripeClientSecret('');
    setStripeIntentId('');
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) reset();
  };

  const handleProceed = () => {
    if (!finalAmount || finalAmount <= 0) { setError('Please select or enter an amount.'); return; }
    setError('');
    setStep('email');
  };

  const handlePay = async () => {
    if (!payerEmail || !payerEmail.includes('@')) { setError('Please enter a valid email.'); return; }
    setError('');
    setLoading(true);
    try {
      if (gateway === 'paystack') {
        const { reference, accessCode } = await paymentService.initializePaystack({
          type: 'tip', postId, amount: finalAmount, currency: 'NGN', payerName, payerEmail,
        });
        const handler = (window as any).PaystackPop.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
          email: payerEmail,
          amount: finalAmount * 100,
          currency: 'NGN',
          ref: reference,
          access_code: accessCode,
          callback: function(response: { reference: string }) {
            paymentService.verifyPaystack(response.reference || reference, 'tip')
              .then(() => setStep('success'))
              .catch(() => setError('Verification failed. Please contact support.'))
              .finally(() => setLoading(false));
          },
          onClose: function() { setLoading(false); },
        });
        handler.openIframe();
      } else {
        const { clientSecret, paymentIntentId } = await paymentService.createStripeIntent({
          type: 'tip', postId, amount: finalAmount, currency: 'usd', payerEmail,
        });
        setStripeClientSecret(clientSecret);
        setStripeIntentId(paymentIntentId);
        setStep('stripe-form');
      }
    } catch (err: any) {
      setError(err.message || 'Payment initialization failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
      >
        <Heart className="h-5 w-5 fill-white group-hover:scale-125 transition-transform" />
        Support this article
        <ChevronRight className="h-4 w-4 opacity-70" />
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500 fill-rose-500" /> Tip the author
            </DialogTitle>
          </DialogHeader>

          {step === 'success' ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-lg">Thank you so much! 🎉</p>
                <p className="text-muted-foreground text-sm mt-1">Your support means the world to the author.</p>
              </div>
              <Button className="w-full" onClick={() => handleOpenChange(false)}>Close</Button>
            </div>

          ) : step === 'stripe-form' && stripeClientSecret ? (
            <div className="pt-2">
              <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret, appearance: { theme: 'stripe' } }}>
                <StripeForm
                  clientSecret={stripeClientSecret}
                  paymentIntentId={stripeIntentId}
                  onSuccess={() => setStep('success')}
                  onCancel={() => setStep('email')}
                />
              </Elements>
            </div>

          ) : step === 'email' ? (
            <div className="space-y-4 pt-2">
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                Tipping <strong>{currencySymbol}{finalAmount.toLocaleString()}</strong> via{' '}
                <strong className="capitalize">{gateway}</strong>
              </div>
              <div className="space-y-2">
                <Label>Your name (optional)</Label>
                <Input placeholder="Anonymous" value={payerName} onChange={(e) => setPayerName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email address <span className="text-destructive">*</span></Label>
                <Input type="email" placeholder="you@example.com" value={payerEmail} onChange={(e) => setPayerEmail(e.target.value)} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep('select')}>Back</Button>
                <Button className="flex-1" onClick={handlePay} disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Continue
                </Button>
              </div>
            </div>

          ) : (
            <div className="space-y-5 pt-2">
              {/* Gateway selector */}
              <div className="grid grid-cols-2 gap-2">
                {(['paystack', 'stripe'] as const).map((gw) => (
                  <button
                    key={gw}
                    onClick={() => { setGateway(gw); setSelectedAmount(null); setCustomAmount(''); }}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-sm font-medium transition-all',
                      gateway === gw ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/40'
                    )}
                  >
                    {gw === 'paystack' ? <PaystackLogo className="h-10 w-10" /> : <StripeLogo className="h-10 w-16" />}
                    <span className="capitalize">{gw}</span>
                    <span className="text-[10px] font-normal text-muted-foreground">
                      {gw === 'paystack' ? 'NGN · Nigeria' : 'USD · International'}
                    </span>
                  </button>
                ))}
              </div>

              {/* Amount pills */}
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Select amount</Label>
                <div className="grid grid-cols-3 gap-2">
                  {amounts.map((a) => (
                    <button
                      key={a}
                      onClick={() => { setSelectedAmount(a); setCustomAmount(''); }}
                      className={cn(
                        'rounded-xl border-2 py-3 font-semibold text-sm transition-all',
                        selectedAmount === a
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      {currencySymbol}{a.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom amount */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Or enter custom amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">{currencySymbol}</span>
                  <Input
                    type="number"
                    min={1}
                    className="pl-7"
                    placeholder="Custom"
                    value={customAmount}
                    onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                  />
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button className="w-full" size="lg" onClick={handleProceed} disabled={!finalAmount || finalAmount <= 0}>
                <Heart className="h-4 w-4 mr-2 fill-current" />
                Tip {finalAmount > 0 ? `${currencySymbol}${finalAmount.toLocaleString()}` : ''}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
