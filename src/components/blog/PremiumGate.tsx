'use client';

import { useState, useEffect } from 'react';
import { Lock, Unlock, CreditCard, Smartphone, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { paymentService } from '@/services/payment.service';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '@/context/AuthContext';
import PostContent from './PostContent';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '');

function StripeGateForm({
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
      await paymentService.verifyStripe(paymentIntentId, 'purchase');
      onSuccess();
    } catch {
      setError('Verification failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>Back</Button>
        <Button type="submit" className="flex-1" disabled={loading || !stripe}>
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Pay & Unlock
        </Button>
      </div>
    </form>
  );
}

function truncateHtml(html: string, charLimit = 600): string {
  const text = html.replace(/<[^>]+>/g, '');
  if (text.length <= charLimit) return html;
  let count = 0;
  let result = '';
  const tagRe = /<[^>]+>/g;
  let lastIndex = 0;
  let match;
  while ((match = tagRe.exec(html)) !== null) {
    const between = html.slice(lastIndex, match.index);
    if (count + between.length >= charLimit) {
      result += between.slice(0, charLimit - count) + '...';
      return result;
    }
    result += between + match[0];
    count += between.length;
    lastIndex = match.index + match[0].length;
  }
  result += html.slice(lastIndex, lastIndex + (charLimit - count)) + '...';
  return result;
}

interface PremiumGateProps {
  postId: string;
  fullContent: string;
  price: number;
  priceUSD?: number;
}

export default function PremiumGate({ postId, fullContent, price, priceUSD }: PremiumGateProps) {
  const { user } = useAuth();
  const [purchased, setPurchased] = useState(false);
  const [checking, setChecking] = useState(true);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'gateway' | 'email' | 'stripe-form' | 'success'>('gateway');
  const [gateway, setGateway] = useState<'paystack' | 'stripe'>('paystack');
  const [payerEmail, setPayerEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stripeClientSecret, setStripeClientSecret] = useState('');
  const [stripeIntentId, setStripeIntentId] = useState('');
  const previewHtml = truncateHtml(fullContent, 600);
  const usdPrice = priceUSD || Math.round((price / 1500) * 100) / 100;
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
  useEffect(() => {
    if (user?.email) setPayerEmail(user.email);
    if (!document.getElementById('paystack-script')) {
      const s = document.createElement('script');
      s.id = 'paystack-script';
      s.src = 'https://js.paystack.co/v1/inline.js';
      document.head.appendChild(s);
    }
    paymentService
      .checkPurchase(postId, user?.email)
      .then((d) => setPurchased(d.purchased))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [postId, user?.email]);

  const reset = () => {
    setStep('gateway');
    setError('');
    setStripeClientSecret('');
    setStripeIntentId('');
  };

  const handlePay = async () => {
    if (!payerEmail || !payerEmail.includes('@')) { setError('Please enter a valid email.'); return; }
    setError('');
    setLoading(true);
    try {
      if (gateway === 'paystack') {
        const { reference, accessCode } = await paymentService.initializePaystack({
          type: 'purchase', postId, amount: price, currency: 'NGN', payerEmail,
        });
        const handler = (window as any).PaystackPop.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
          email: payerEmail,
          amount: price * 100,
          currency: 'NGN',
          ref: reference,
          access_code: accessCode,
          callback: function(response: { reference: string }) {
            paymentService.verifyPaystack(response.reference || reference, 'purchase')
              .then(() => {
                setStep('success');
                setTimeout(() => { setPurchased(true); setOpen(false); }, 2000);
              })
              .catch(() => setError('Verification failed. Please contact support.'))
              .finally(() => setLoading(false));
          },
          onClose: function() { setLoading(false); },
        });
        handler.openIframe();
      } else {
        const { clientSecret, paymentIntentId } = await paymentService.createStripeIntent({
          type: 'purchase', postId, amount: usdPrice, currency: 'usd', payerEmail,
        });
        setStripeClientSecret(clientSecret);
        setStripeIntentId(paymentIntentId);
        setStep('stripe-form');
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="h-32 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (purchased) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-4 text-green-600 text-sm font-medium">
          <Unlock className="h-4 w-4" /> Full content unlocked
        </div>
        <PostContent html={fullContent} />
      </div>
    );
  }

  return (
    <>
      {/* Preview with fade */}
      <div className="relative">
        <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none">
          <PostContent html={previewHtml} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
      </div>

      {/* Lock card */}
      <div className="mt-6 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-8 text-center shadow-sm">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Lock className="h-7 w-7 text-primary" />
        </div>
        <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">Premium Article</Badge>
        <h3 className="text-xl font-bold mb-2">This is premium content</h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
          Unlock the full article with a one-time payment. Get instant, permanent access.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <div className="text-2xl font-extrabold text-primary">
            ₦{price.toLocaleString()}
            <span className="text-sm font-normal text-muted-foreground ml-2">/ ${usdPrice} USD</span>
          </div>
          <Button size="lg" className="px-8" onClick={() => setOpen(true)}>
            <Lock className="h-4 w-4 mr-2" /> Unlock Now
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" /> Unlock Full Article
            </DialogTitle>
          </DialogHeader>

          {step === 'success' ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-lg">Access Granted! 🎉</p>
                <p className="text-muted-foreground text-sm mt-1">The full article is now unlocked for you.</p>
              </div>
            </div>

          ) : step === 'stripe-form' && stripeClientSecret ? (
            <div className="pt-2">
              <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret, appearance: { theme: 'stripe' } }}>
                <StripeGateForm
                  clientSecret={stripeClientSecret}
                  paymentIntentId={stripeIntentId}
                  onSuccess={() => { setStep('success'); setTimeout(() => { setPurchased(true); setOpen(false); }, 2000); }}
                  onCancel={() => setStep('email')}
                />
              </Elements>
            </div>

          ) : step === 'email' ? (
            <div className="space-y-4 pt-2">
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                Unlocking for{' '}
                <strong>{gateway === 'paystack' ? `₦${price.toLocaleString()}` : `$${usdPrice}`}</strong>{' '}
                via <strong className="capitalize">{gateway}</strong>
              </div>
              <div className="space-y-2">
                <Label>Email address <span className="text-destructive">*</span></Label>
                <Input type="email" placeholder="you@example.com" value={payerEmail} onChange={(e) => setPayerEmail(e.target.value)} />
                <p className="text-xs text-muted-foreground">Used to track your purchase access.</p>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep('gateway')}>Back</Button>
                <Button className="flex-1" onClick={handlePay} disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Pay & Unlock
                </Button>
              </div>
            </div>

          ) : (
            <div className="space-y-5 pt-2">
              <div className="grid grid-cols-2 gap-2">
                {(['paystack', 'stripe'] as const).map((gw) => (
                  <button
                    key={gw}
                    onClick={() => setGateway(gw)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-sm font-medium transition-all',
                      gateway === gw ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/40'
                    )}
                  >
                    {gw === 'paystack' ? <PaystackLogo className="h-5 w-5" /> : <StripeLogo className="h-5 w-5" />}
                    <span className="capitalize">{gw}</span>
                    <span className="text-[10px] font-normal text-muted-foreground">
                      {gw === 'paystack' ? `₦${price.toLocaleString()} · NGN` : `$${usdPrice} · USD`}
                    </span>
                  </button>
                ))}
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button className="w-full" size="lg" onClick={() => setStep('email')}>
                Continue with <span className="capitalize ml-1">{gateway}</span>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
