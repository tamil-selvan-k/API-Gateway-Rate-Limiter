import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Shield, BarChart3, Globe, Zap as ZapIcon, CheckCircle2, ArrowRight, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './LandingPage.css';

export default function LandingPage() {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && user) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, isLoading, navigate]);

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner" />
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="landing-page">
            {/* Navbar */}
            <nav className="landing-nav">
                <div className="container landing-nav__inner">
                    <div className="landing-nav__brand">
                        <div className="sidebar__logo">
                            <ZapIcon size={20} />
                        </div>
                        <span className="sidebar__title">GateZentry</span>
                    </div>
                    
                    <div className="landing-nav__links">
                        <a href="#features" className="landing-nav__link">Features</a>
                        {!user && (
                            <>
                                <Link to="/login" className="btn btn--outline btn--sm">Log in</Link>
                                <Link to="/register" className="btn btn--primary btn--sm">Sign up</Link>
                            </>
                        )}
                        {user && (
                            <Link to="/dashboard" className="btn btn--primary btn--sm">Go to Dashboard</Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero">
                <div className="container">
                    <motion.div 
                        className="hero__content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="hero__badge">
                            <span className="badge badge--plan">Next-Gen Rate Limiting</span>
                        </div>
                        <h1 className="hero__title">
                            Your fastest path to <span className="text-gradient">secure APIs</span>
                        </h1>
                        <p className="hero__subtitle">
                            Scale your applications with confidence. Powerful rate limiting, 
                            real-time analytics, and enterprise-grade security for your modern API infrastructure.
                        </p>
                        <div className="hero__actions">
                            <Link to="/register" className="btn btn--primary btn--lg">
                                Start Building for Free
                                <ArrowRight size={18} />
                            </Link>
                            <a href="#features" className="btn btn--outline btn--lg">
                                View Features
                            </a>
                        </div>
                    </motion.div>

                    <motion.div 
                        className="hero__visual"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <div className="hero__dashboard-preview">
                            <div className="preview-window">
                                <div className="preview-header">
                                    <div className="dots"><span/><span/><span/></div>
                                    <div className="address-bar">gatezentry.io/dashboard</div>
                                </div>
                                <div className="preview-body">
                                    <div className="preview-sidebar"></div>
                                    <div className="preview-main">
                                        <div className="preview-chart-row">
                                            <div className="preview-card-sm"></div>
                                            <div className="preview-card-sm"></div>
                                            <div className="preview-card-sm"></div>
                                        </div>
                                        <div className="preview-chart-main"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="hero__glow" />
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* Features Grid */}
            <section id="features" className="features">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Built for the modern edge</h2>
                        <p className="section-subtitle">Everything you need to manage, protect, and scale your APIs globally.</p>
                    </div>

                    <div className="features__grid">
                        {[
                            {
                                icon: <Zap color="var(--brand-400)" />,
                                title: "Ultra-Fast Execution",
                                desc: "Distributed rate limiting with sub-millisecond latency using our globally distributed edge network."
                            },
                            {
                                icon: <Shield color="var(--brand-400)" />,
                                title: "Adaptive Security",
                                desc: "Intelligent threat detection and automated blocking of malicious traffic patterns."
                            },
                            {
                                icon: <BarChart3 color="var(--brand-400)" />,
                                title: "Real-time Insights",
                                desc: "Deep visibility into your API traffic with granular analytics and custom reporting."
                            },
                            {
                                icon: <Globe color="var(--brand-400)" />,
                                title: "Multi-Region Support",
                                desc: "Deploy your rules across multiple regions to ensure high availability and low latency."
                            },
                            {
                                icon: <Key color="var(--brand-400)" />,
                                title: "Key Management",
                                desc: "Robust API key management with usage tiers, expiration, and rotation policies."
                            },
                            {
                                icon: <CheckCircle2 color="var(--brand-400)" />,
                                title: "Effortless Integration",
                                desc: "Works seamlessly with any framework. Simple headers and intuitive SDKs for developers."
                            }
                        ].map((feature, i) => (
                            <motion.div 
                                key={i}
                                className="feature-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="feature-card__icon">{feature.icon}</div>
                                <h3 className="feature-card__title">{feature.title}</h3>
                                <p className="feature-card__desc">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="container text-center">
                    <div className="cta__card">
                        <h2 className="cta__title">Ready to scale your APIs?</h2>
                        <p className="cta__subtitle">Join thousands of developers building fast and secure infrastructure.</p>
                        <div className="cta__actions">
                            <Link to="/register" className="btn btn--primary btn--lg">Get Started Now</Link>
                            <Link to="/login" className="btn btn--outline btn--lg">Sign In</Link>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
