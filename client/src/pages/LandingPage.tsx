import { Link } from 'react-router-dom';
import { Heart, Shield, Brain, Users, Activity, ArrowRight } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900">HealthGuard AI</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Login
              </Link>
              <Link to="/login" className="px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            HealthGuard AI
          </h1>
          <p className="text-2xl text-teal-300 font-medium mb-4">
            Your Health. Your Data. Your Control.
          </p>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
            AI-powered health monitoring that puts you in control of your health data.
            Share selectively with healthcare providers while maintaining complete privacy.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/login"
              className="px-8 py-3 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-400 transition-colors flex items-center gap-2"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 rounded-xl border border-slate-600 text-white font-semibold hover:bg-slate-800 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Comprehensive Health Intelligence
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Activity, title: 'Health Monitoring', description: 'Track vital signs, sleep, activity, and hydration with continuous monitoring and intelligent alerts.' },
              { icon: Brain, title: 'AI Intelligence', description: 'Advanced AI analyzes your health data to predict risks and provide personalized recommendations.' },
              { icon: Shield, title: 'Privacy First', description: 'You control your data. Share selectively with doctors and revoke access anytime.' },
              { icon: Users, title: 'Doctor Collaboration', description: 'Share specific health data with healthcare providers for better-informed care decisions.' },
            ].map((feature) => (
              <div key={feature.title} className="p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Connect Your Devices', description: 'Pair your smartwatch, fitness tracker, or other health devices to start tracking vital signs automatically.' },
              { step: '2', title: 'AI Analyzes Your Health', description: 'Our AI engine continuously monitors your data, assesses risks, and provides personalized health insights.' },
              { step: '3', title: 'Share with Your Doctor', description: 'Choose exactly what data to share with your healthcare providers. You maintain full control and can revoke access anytime.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-teal-500 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Take Control of Your Health Today
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Join HealthGuard AI and experience the future of personalized, privacy-first health monitoring.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-teal-600 text-white text-lg font-semibold hover:bg-teal-700 transition-colors"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 rounded bg-teal-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">HealthGuard AI</span>
          </div>
          <p className="text-sm text-slate-500">
            &copy; 2026 HealthGuard AI. Your Health. Your Data. Your Control.
          </p>
        </div>
      </footer>
    </div>
  );
}
