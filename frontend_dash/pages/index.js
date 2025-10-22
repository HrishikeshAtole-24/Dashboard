import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { EyeIcon, ChartBarIcon, GlobeAltIcon, ArrowRightIcon } from '../components/icons';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="loading-dots">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen homepage-container transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Navigation */}
      <nav className="homepage-nav">
        <div className="nav-container">
          <div className="nav-content">
            <div className="nav-brand">
              <div className="brand-icon">
                <ChartBarIcon className="h-8 w-8" />
              </div>
              <span className="brand-text">Analytics Dashboard</span>
            </div>
            <div className="nav-actions">
              <Link href="/login" className="nav-login-btn">
                Sign In
              </Link>
              <Link href="/register" className="nav-signup-btn">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <section className="hero-section">
          <div className="hero-container">
            <div className="hero-content">
              <div className="hero-badge">
                <span>✨ Real-time insights at your fingertips</span>
              </div>
              <h1 className="hero-title">
                <span className="title-main">Powerful Analytics for</span>
                <span className="title-accent">Modern Websites</span>
              </h1>
              <p className="hero-description">
                Transform raw data into actionable insights. Monitor visitor behavior, 
                track performance metrics, and make informed decisions to grow your online presence.
              </p>
              <div className="hero-actions">
                <Link href="/register" className="hero-primary-btn">
                  <span>Get Started Free</span>
                  <ArrowRightIcon className="btn-icon" />
                </Link>
                <Link href="/login" className="hero-secondary-btn">
                  <span>View Live Demo</span>
                </Link>
              </div>
              <div className="hero-stats">
                <div className="hero-stat-item">
                  <div className="stat-number">25K+</div>
                  <div className="stat-label">Websites Monitored</div>
                </div>
                <div className="stat-divider"></div>
                <div className="hero-stat-item">
                  <div className="stat-number">99.9%</div>
                  <div className="stat-label">Uptime Guarantee</div>
                </div>
                <div className="stat-divider"></div>
                <div className="hero-stat-item">
                  <div className="stat-number">100M+</div>
                  <div className="stat-label">Events Processed</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="features-container">
            <div className="features-header">
              <div className="section-badge">FEATURES</div>
              <h2 className="section-title">
                Everything you need to understand your visitors
              </h2>
              <p className="section-description">
                Our analytics platform provides comprehensive insights into your 
                website performance.
              </p>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon realtime">
                  <EyeIcon className="h-6 w-6" />
                </div>
                <div className="feature-content">
                  <h3 className="feature-title">Real-time Tracking</h3>
                  <p className="feature-description">
                    Monitor your website visitors in real-time. See who's on your site 
                    right now and what they're doing.
                  </p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon charts">
                  <ChartBarIcon className="h-6 w-6" />
                </div>
                <div className="feature-content">
                  <h3 className="feature-title">Beautiful Charts</h3>
                  <p className="feature-description">
                    Visualize your data with beautiful, interactive charts and graphs 
                    that make insights clear.
                  </p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon integration">
                  <GlobeAltIcon className="h-6 w-6" />
                </div>
                <div className="feature-content">
                  <h3 className="feature-title">Easy Integration</h3>
                  <p className="feature-description">
                    Add our tracking script to your website with just one line of code. 
                    No complex setup required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="stats-container">
            <div className="stats-header">
              <h2 className="stats-title">
                Trusted by teams of all sizes
              </h2>
              <p className="stats-description">
                From startups to enterprises, our platform delivers insights that drive growth.
              </p>
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">150+</div>
                <div className="stat-label">Countries Served</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Expert Support</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">5★</div>
                <div className="stat-label">Customer Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-container">
            <div className="cta-content">
              <div className="cta-text">
                <h2 className="cta-title">
                  <span className="cta-title-main">Ready to get started?</span>
                  <span className="cta-title-accent">Create your account today.</span>
                </h2>
              </div>
              <div className="cta-actions">
                <Link
                  href="/register"
                  className="cta-button"
                >
                  Get started
                  <ArrowRightIcon className="cta-icon" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="homepage-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-tech">
              <span className="footer-tech-text">
                Built with Next.js, Express, and MongoDB
              </span>
            </div>
            <div className="footer-copyright">
              <p className="footer-copyright-text">
                &copy; 2025 Analytics Dashboard. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}