import { useState, ChangeEvent, FormEvent, ReactNode } from 'react';
import {
  Ripple,
  AuthTabs,
  TechOrbitDisplay,
  FieldType,
} from '@/components/ui/modern-animated-sign-in';
import { useAuth } from '@/context/AuthContext';
import {
  FileText,
  Sparkles,
  Brain,
  Download,
  Search,
  UserCheck,
  Briefcase,
  PenTool,
  Share2
} from 'lucide-react';

type FormData = {
  email: string;
  password: string;
};

interface OrbitIcon {
  component: () => ReactNode;
  className: string;
  duration?: number;
  delay?: number;
  radius?: number;
  path?: boolean;
  reverse?: boolean;
}

const iconsArray: OrbitIcon[] = [
  {
    component: () => <FileText className="w-full h-full text-blue-500" />,
    className: 'size-[30px] border-none bg-transparent',
    duration: 20,
    delay: 20,
    radius: 100,
    path: false,
    reverse: false,
  },
  {
    component: () => <Sparkles className="w-full h-full text-yellow-500" />,
    className: 'size-[30px] border-none bg-transparent',
    duration: 20,
    delay: 10,
    radius: 100,
    path: false,
    reverse: false,
  },
  {
    component: () => <Brain className="w-full h-full text-purple-500" />,
    className: 'size-[50px] border-none bg-transparent',
    radius: 210,
    duration: 20,
    path: false,
    reverse: false,
  },
  {
    component: () => <Download className="w-full h-full text-green-500" />,
    className: 'size-[50px] border-none bg-transparent',
    radius: 210,
    duration: 20,
    delay: 20,
    path: false,
    reverse: false,
  },
  {
    component: () => <Search className="w-full h-full text-red-500" />,
    className: 'size-[30px] border-none bg-transparent',
    duration: 20,
    delay: 20,
    radius: 150,
    path: false,
    reverse: true,
  },
  {
    component: () => <UserCheck className="w-full h-full text-indigo-500" />,
    className: 'size-[30px] border-none bg-transparent',
    duration: 20,
    delay: 10,
    radius: 150,
    path: false,
    reverse: true,
  },
  {
    component: () => <Briefcase className="w-full h-full text-orange-500" />,
    className: 'size-[50px] border-none bg-transparent',
    radius: 270,
    duration: 20,
    path: false,
    reverse: true,
  },
  {
    component: () => <PenTool className="w-full h-full text-pink-500" />,
    className: 'size-[50px] border-none bg-transparent',
    radius: 270,
    duration: 20,
    delay: 60,
    path: false,
    reverse: true,
  },
  {
    component: () => <Share2 className="w-full h-full text-cyan-500" />,
    className: 'size-[50px] border-none bg-transparent',
    radius: 320,
    duration: 20,
    delay: 20,
    path: false,
    reverse: false,
  },
];

export default function LoginPage() {
  const { signIn, signInWithGoogle, signInWithGitHub } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  const goToForgotPassword = (
    event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    event.preventDefault();
    console.log('forgot password');
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    name: keyof FormData
  ) => {
    const value = event.target.value;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await signIn(formData.email, formData.password);
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
      console.error(err);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      setError('Failed to sign in with Google.');
      console.error(err);
    }
  };

  const handleGitHubSignIn = async () => {
    try {
      await signInWithGitHub();
    } catch (err) {
      setError('Failed to sign in with GitHub.');
      console.error(err);
    }
  };

  const formFields = {
    header: 'Welcome back',
    subHeader: 'Sign in to your account',
    fields: [
      {
        label: 'Email',
        required: true,
        type: 'email' as FieldType,
        placeholder: 'Enter your email address',
        onChange: (event: ChangeEvent<HTMLInputElement>) =>
          handleInputChange(event, 'email'),
      },
      {
        label: 'Password',
        required: true,
        type: 'password' as FieldType,
        placeholder: 'Enter your password',
        onChange: (event: ChangeEvent<HTMLInputElement>) =>
          handleInputChange(event, 'password'),
      },
    ],
    submitButton: 'Sign in',
    textVariantButton: 'Forgot password?',
    errorField: error || undefined,
  };

  return (
    <section className='flex max-lg:justify-center h-screen overflow-hidden bg-white dark:bg-black relative'>


      {/* Left Side */}
      <span className='flex flex-col justify-center w-1/2 max-lg:hidden relative'>
        <Ripple mainCircleSize={100} />
        <TechOrbitDisplay iconsArray={iconsArray} text="Prativeda" />
      </span>

      {/* Right Side */}
      <span className='w-1/2 h-[100dvh] flex flex-col justify-center items-center max-lg:w-full max-lg:px-[10%]'>
        <AuthTabs
          formFields={formFields}
          goTo={goToForgotPassword}
          handleSubmit={handleSubmit}
          onGoogleLogin={handleGoogleSignIn}
          onGithubLogin={handleGitHubSignIn}
        />
      </span>
    </section>
  );
}
