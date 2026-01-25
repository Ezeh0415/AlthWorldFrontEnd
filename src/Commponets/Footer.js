import React from "react";
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  LockOutlined,
  GlobalOutlined,
  CopyrightOutlined,
  ArrowRightOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import "../styles/Footer.css";
import logo from "../Assets/ChatGPT Image Jan 22, 2026, 12_37_21 AM.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const companyLinks = [
    { name: "About Us", path: "/about" },
    { name: "Investment Plans", path: "/plans" },
    { name: "How It Works", path: "/how-it-works" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
    { name: "Cookie Policy", path: "/cookies" },
    { name: "Legal", path: "/legal" },
    { name: "Compliance", path: "/compliance" },
    { name: "Disclosures", path: "/disclosures" },
  ];

  const securityFeatures = [
    {
      name: "256-bit SSL",
      icon: <LockOutlined className="footer__security-icon" />,
    },
    {
      name: "Regulated",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="footer__shield-icon"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
          />
        </svg>
      ),
    },
    {
      name: "Insurance",
      icon: <SafetyCertificateOutlined className="footer__insurance-icon" />,
    },
  ];

  const socialMedia = [
    {
      icon: <FacebookOutlined className="footer__social-icon" />,
      name: "Facebook",
      url: "#",
    },
    {
      icon: <TwitterOutlined className="footer__social-icon" />,
      name: "Twitter",
      url: "#",
    },
    {
      icon: <InstagramOutlined className="footer__social-icon" />,
      name: "Instagram",
      url: "#",
    },
    {
      icon: <LinkedinOutlined className="footer__social-icon" />,
      name: "LinkedIn",
      url: "#",
    },
  ];

  const newsletterSignup = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    if (email) {
      console.log("Subscribed with:", email);
      e.target.reset();
    }
  };

  return (
    <footer className="footer__container">
      {/* Main Footer Content */}
      <div className="footer__main-content">
        <div className="footer__grid-container">
          {/* Brand Section */}
          <div className="footer__brand-section">
            <div className="footer__logo-container">
              <img
                src={logo}
                alt="Crypto Invest"
                className="footer__logo-img"
              />
              <p className="footer__tagline">Secure • Smart • Profitable</p>
            </div>
            <p className="footer__company-description">
              Professional cryptocurrency investment platform with
              institutional-grade security and transparent returns.
            </p>

            {/* Security Badges */}
            <div className="footer__security-section">
              <h4 className="footer__security-title">Security & Compliance</h4>
              <div className="footer__badges-grid">
                {securityFeatures.map((feature, index) => (
                  <div key={index} className="footer__security-badge">
                    <span className="footer__badge-icon">{feature.icon}</span>
                    <span className="footer__badge-text">{feature.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div className="footer__social-section">
              <h4 className="footer__social-title">Connect With Us</h4>
              <div className="footer__social-icons">
                {socialMedia.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    className="footer__social-link"
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

          {/* Links Sections */}
          <div className="footer__links-grid">
            <div className="footer__links-section">
              <h3 className="footer__section-title">Company</h3>
              <ul className="footer__links-list">
                {companyLinks.map((link, index) => (
                  <li key={index} className="footer__list-item">
                    <a href={link.path} className="footer__link">
                      <ArrowRightOutlined className="footer__link-icon" />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer__links-section">
              <h3 className="footer__section-title">Legal</h3>
              <ul className="footer__links-list">
                {legalLinks.map((link, index) => (
                  <li key={index} className="footer__list-item">
                    <a href={link.path} className="footer__link">
                      <ArrowRightOutlined className="footer__link-icon" />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="footer__newsletter-section">
            <h3 className="footer__section-title">Stay Updated</h3>
            <p className="footer__newsletter-description">
              Get weekly market insights and investment strategies.
            </p>

            <form
              onSubmit={newsletterSignup}
              className="footer__newsletter-form"
            >
              <div className="footer__input-group">
                <MailOutlined className="footer__input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="Your email address"
                  required
                  className="footer__newsletter-input"
                />
                <button type="submit" className="footer__subscribe-btn">
                  Subscribe
                </button>
              </div>
            </form>

            {/* Contact Info */}
            <div className="footer__contact-info">
              <div className="footer__contact-item">
                <PhoneOutlined className="footer__contact-icon" />
                <span className="footer__contact-text">+1 (555) 123-4567</span>
              </div>
              <div className="footer__contact-item">
                <MailOutlined className="footer__contact-icon" />
                <span className="footer__contact-text">
                  support@cryptoinvest.com
                </span>
              </div>
              <div className="footer__contact-item">
                <EnvironmentOutlined className="footer__contact-icon" />
                <span className="footer__contact-text">
                  Global Headquarters
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer__bottom-bar">
        <div className="footer__bottom-container">
          <div className="footer__copyright">
            <CopyrightOutlined className="footer__copyright-icon" />
            <span className="footer__copyright-text">
              {currentYear} AlthWorld. All rights reserved.
            </span>
          </div>

          <div className="footer__bottom-links">
            <a href="/privacy" className="footer__bottom-link">
              Privacy
            </a>
            <span className="footer__link-separator">•</span>
            <a href="/terms" className="footer__bottom-link">
              Terms
            </a>
            <span className="footer__link-separator">•</span>
            <a href="/cookies" className="footer__bottom-link">
              Cookies
            </a>
            <span className="footer__link-separator">•</span>
            <a href="/sitemap" className="footer__bottom-link">
              Sitemap
            </a>
          </div>

          <div className="footer__global-info">
            <GlobalOutlined className="footer__global-icon" />
            <span className="footer__global-text">Available worldwide</span>
          </div>
        </div>
      </div>

      {/* Risk Disclaimer */}
      <div className="footer__disclaimer">
        <div className="footer__disclaimer-container">
          <p className="footer__disclaimer-text">
            <strong className="footer__disclaimer-strong">Risk Warning:</strong>{" "}
            Investing in digital assets carries significant risk. The value of
            investments can go down as well as up. Past performance is not
            indicative of future results. This platform is intended for
            experienced investors who understand these risks.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
