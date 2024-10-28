import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Button, Input } from '@nextui-org/react';
import { User, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (isLogin) {
        await login(username, password);
        navigate('/portfolio');
      } else {
        await register(username, email, password);
        await login(username, password);
        navigate('/portfolio');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-default-100">
      <Card 
        className="w-full max-w-md backdrop-blur-sm"
        classNames={{
          base: theme === 'dark' 
            ? 'bg-default-50/30 border border-default-100/50' 
            : 'bg-default-50'
        }}
      >
        <CardBody className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light mb-2">Welcome</h2>
            <p className="text-sm text-default-500">
              {isLogin ? 'Login to your account' : 'Create a new account'}
            </p>
          </div>

          <div className="flex gap-2 mb-8">
            <Button
              onClick={() => setIsLogin(true)}
              className={`flex-1 ${
                isLogin 
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-500 dark:text-purple-300' 
                : 'bg-default-100/50 hover:bg-default-200/50'
              }`}
              variant="flat"
            >
              Login
            </Button>
            <Button
              onClick={() => setIsLogin(false)}
              className={`flex-1 ${
                !isLogin 
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-500 dark:text-purple-300' 
                : 'bg-default-100/50 hover:bg-default-200/50'
              }`}
              variant="flat"
            >
              Sign Up
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              startContent={
                <User className="text-default-400 w-4 h-4" />
              }
              classNames={{
                input: "bg-transparent",
                inputWrapper: theme === 'dark' 
                  ? "bg-default-100/20 backdrop-blur-sm border-default-200/20" 
                  : "bg-default-100",
                label: "text-default-500"
              }}
              required
            />

            {!isLogin && (
              <Input
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                startContent={
                  <Mail className="text-default-400 w-4 h-4" />
                }
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: theme === 'dark' 
                    ? "bg-default-100/20 backdrop-blur-sm border-default-200/20" 
                    : "bg-default-100",
                  label: "text-default-500"
                }}
                required
              />
            )}

            <Input
              label="Password"
              type="password"
              placeholder={isLogin ? "Enter your password" : "Choose a password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              startContent={
                <Lock className="text-default-400 w-4 h-4" />
              }
              classNames={{
                input: "bg-transparent",
                inputWrapper: theme === 'dark' 
                  ? "bg-default-100/20 backdrop-blur-sm border-default-200/20" 
                  : "bg-default-100",
                label: "text-default-500"
              }}
              required
            />

            {error && (
              <div className="p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger text-sm backdrop-blur-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className={`w-full ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-purple-500/25'
                  : 'bg-primary'
              }`}
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Please wait
                </div>
              ) : (
                isLogin ? 'Login' : 'Sign Up'
              )}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
