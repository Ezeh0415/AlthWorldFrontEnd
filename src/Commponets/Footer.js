import React from "react";
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  YoutubeOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SafetyOutlined,
  LockOutlined,
  GlobalOutlined,
  CopyrightOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import "../styles/Footer.css";
import BackToTopButton from "./BackToTopButton";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "About Us", path: "/about" },
    { name: "Investment Plans", path: "/plans" },
    { name: "How It Works", path: "/how-it-works" },
    { name: "FAQs", path: "/faq" },
    { name: "Support Center", path: "/support" },
    { name: "Contact Us", path: "/contact" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
    { name: "Cookie Policy", path: "/cookies" },
    { name: "AML Policy", path: "/aml" },
    { name: "Risk Disclosure", path: "/risk" },
    { name: "Legal Documents", path: "/legal" },
  ];

  const contactInfo = [
    { icon: <MailOutlined />, text: "support@cryptoinvest.com" },
    { icon: <PhoneOutlined />, text: "+1 (555) 123-4567" },
    { icon: <EnvironmentOutlined />, text: "123 Crypto Street, Digital City" },
  ];

  const socialMedia = [
    { icon: <FacebookOutlined />, name: "Facebook", url: "#" },
    { icon: <TwitterOutlined />, name: "Twitter", url: "#" },
    { icon: <InstagramOutlined />, name: "Instagram", url: "#" },
    { icon: <LinkedinOutlined />, name: "LinkedIn", url: "#" },
    { icon: <YoutubeOutlined />, name: "YouTube", url: "#" },
  ];

  const securityBadges = [
    { icon: <SafetyOutlined />, text: "SSL Secured" },
    { icon: <LockOutlined />, text: "256-bit Encryption" },
    { icon: <GlobalOutlined />, text: "Global Compliance" },
  ];

  const newsletterSignup = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    if (email) {
      alert(`Thank you for subscribing with: ${email}`);
      e.target.reset();
    }
  };

  return (
    <footer className="footer">
      {/* Top Section */}
      <div className="footer-top">
        <div className="footer-container">
          <div className="footer-section about-section">
            <div className="footer-logo">
              <h2>AlthWorld</h2>
              <p className="tagline">
                Secure Your Future with Smart Investments
              </p>
            </div>
            <p className="company-description">
              We provide secure, transparent, and profitable investment
              opportunities in the cryptocurrency market. Join thousands of
              satisfied investors growing their wealth with us.
            </p>
            <div className="security-badges">
              {securityBadges.map((badge, index) => (
                <div key={index} className="security-badge">
                  {badge.icon}
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="footer-section links-section">
            <h3 className="footer-section-title">Quick Links</h3>
            <ul className="footer-links">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.path}>{link.name}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-section legal-section">
            <h3 className="footer-section-title">Legal</h3>
            <ul className="footer-links">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.path}>{link.name}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-section contact-section">
            <h3 className="footer-section-title">Contact Us</h3>
            <div className="contact-info">
              {contactInfo.map((info, index) => (
                <div key={index} className="contact-item">
                  {info.icon}
                  <span>{info.text}</span>
                </div>
              ))}
            </div>

            <div className="newsletter">
              <h4>Stay Updated</h4>
              <form onSubmit={newsletterSignup} className="newsletter-form">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                />
                <button type="submit" className="subscribe-btn">
                  Subscribe
                </button>
              </form>
              <p className="newsletter-note">
                Get the latest investment insights and market updates
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section - Social Media */}
      <div className="footer-middle">
        <div className="footer-container">
          <div className="social-media">
            <h4>Follow Us</h4>
            <div className="social-icons">
              {socialMedia.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="social-icon"
                  aria-label={social.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="footer-bottom">
        <div className="footer-container">
          <div className="copyright">
            <CopyrightOutlined />
            <span>{currentYear} AlthWorld. All rights reserved.</span>
          </div>

          <div className="footer-bottom-links">
            <a href="/sitemap">Sitemap</a>
            <span className="separator">|</span>
            <a href="/accessibility">Accessibility</a>
            <span className="separator">|</span>
            <a href="/responsible-investing">Responsible Investing</a>
          </div>

          <div className="made-with">
            <span>Made with</span>
            <HeartOutlined className="heart-icon" />
            <span>for investors worldwide</span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="footer-disclaimer">
        <div className="footer-container">
          <p>
            <strong>Risk Warning:</strong> Investing in cryptocurrencies
            involves substantial risk of loss and is not suitable for every
            investor. Past performance is not indicative of future results.
            Please review our <a href="/risk-disclosure">Risk Disclosure</a>{" "}
            before investing.
          </p>
          <p className="regulatory-info">
            Crypto Invest is registered with the appropriate regulatory
            authorities. Registration number: CI-2024-001
          </p>
        </div>
      </div>
      <BackToTopButton />
    </footer>
  );
};

export default Footer;
