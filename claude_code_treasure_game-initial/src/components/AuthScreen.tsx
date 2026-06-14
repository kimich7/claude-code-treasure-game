import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { api, setToken } from '../lib/api';
import type { User } from '../types/auth';

interface Props {
  onAuth: (user: User) => void;
  onGuest: () => void;
}

export default function AuthScreen({ onAuth, onGuest }: Props) {
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState('');
  const [signInLoading, setSignInLoading] = useState(false);

  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpError, setSignUpError] = useState('');
  const [signUpLoading, setSignUpLoading] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setSignInError('');
    setSignInLoading(true);
    try {
      const { token, user } = await api.signin(signInEmail, signInPassword);
      setToken(token);
      onAuth(user);
    } catch (err: any) {
      setSignInError(err.message);
    } finally {
      setSignInLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setSignUpError('');
    setSignUpLoading(true);
    try {
      const { token, user } = await api.signup(signUpUsername, signUpEmail, signUpPassword);
      setToken(token);
      onAuth(user);
    } catch (err: any) {
      setSignUpError(err.message);
    } finally {
      setSignUpLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl mb-2 text-amber-900">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>
      <p className="text-amber-700 mb-8 text-center">Sign in to track your scores, or play as a guest.</p>

      <div className="w-full max-w-md">
        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>Welcome back, treasure hunter!</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signInEmail}
                      onChange={e => setSignInEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={signInPassword}
                      onChange={e => setSignInPassword(e.target.value)}
                      required
                    />
                  </div>
                  {signInError && (
                    <p className="text-sm text-red-600">{signInError}</p>
                  )}
                  <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white" disabled={signInLoading}>
                    {signInLoading ? 'Signing in…' : 'Sign In'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>Create an account to save your scores.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="signup-username">Username</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="PirateKing"
                      value={signUpUsername}
                      onChange={e => setSignUpUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signUpEmail}
                      onChange={e => setSignUpEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signUpPassword}
                      onChange={e => setSignUpPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  {signUpError && (
                    <p className="text-sm text-red-600">{signUpError}</p>
                  )}
                  <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white" disabled={signUpLoading}>
                    {signUpLoading ? 'Creating account…' : 'Sign Up'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-4 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-amber-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-amber-50 px-2 text-amber-600">or</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="mt-4 w-full border-amber-400 text-amber-700 hover:bg-amber-100"
            onClick={onGuest}
          >
            Play as Guest
          </Button>
        </div>
      </div>
    </div>
  );
}
