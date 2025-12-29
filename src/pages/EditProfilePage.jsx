import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function EditProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setFormData({
      name: user.name || '',
      email: user.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }

    // If trying to change password
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Le mot de passe actuel est requis';
      }

      if (!formData.newPassword) {
        newErrors.newPassword = 'Le nouveau mot de passe est requis';
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Le mot de passe doit contenir au moins 6 caractères';
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update user info
      const updatedUser = {
        ...user,
        name: formData.name,
        email: formData.email
      };

      updateUser(updatedUser);

      setSuccessMessage('Profil mis à jour avec succès !');

      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      // Redirect after success
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error) {
      setErrors({ general: 'Une erreur est survenue lors de la mise à jour du profil' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Navigation */}
      <nav className="navbar navbar-light bg-white shadow-sm">
        <div className="container">
          <button
            className="btn btn-link text-decoration-none"
            onClick={() => navigate('/profile')}
            style={{ color: '#667eea', fontWeight: '600' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="me-2">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Retour au profil
          </button>
          <span className="navbar-brand mb-0 h5" style={{ color: '#667eea' }}>
            Modifier le profil
          </span>
        </div>
      </nav>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            {/* Edit Profile Form */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '20px' }}>
              <div className="card-body p-4">
                {/* Avatar Section */}
                <div className="text-center mb-4">
                  <div
                    className="d-inline-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      backgroundColor: '#667eea',
                      color: 'white',
                      fontSize: '2.5rem',
                      fontWeight: '700'
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Success Message */}
                {successMessage && (
                  <div className="alert alert-success" role="alert" style={{ borderRadius: '12px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="me-2">
                      <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {successMessage}
                  </div>
                )}

                {/* General Error */}
                {errors.general && (
                  <div className="alert alert-danger" role="alert" style={{ borderRadius: '12px' }}>
                    {errors.general}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Personal Information Section */}
                  <div className="mb-4">
                    <h5 style={{ color: '#667eea', fontWeight: '600', marginBottom: '20px' }}>
                      Informations personnelles
                    </h5>

                    {/* Name Field */}
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label" style={{ fontWeight: '600', color: '#2d3748' }}>
                        Nom complet
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        style={{
                          borderRadius: '12px',
                          padding: '12px 16px',
                          border: '2px solid #e5e7eb'
                        }}
                      />
                      {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                    </div>

                    {/* Email Field */}
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label" style={{ fontWeight: '600', color: '#2d3748' }}>
                        Adresse e-mail
                      </label>
                      <input
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        style={{
                          borderRadius: '12px',
                          padding: '12px 16px',
                          border: '2px solid #e5e7eb'
                        }}
                      />
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>
                  </div>

                  {/* Change Password Section */}
                  <hr className="my-4" />
                  <div className="mb-4">
                    <h5 style={{ color: '#667eea', fontWeight: '600', marginBottom: '20px' }}>
                      Changer le mot de passe
                    </h5>
                    <p className="text-muted small mb-3">
                      Laissez vide si vous ne souhaitez pas changer votre mot de passe
                    </p>

                    {/* Current Password */}
                    <div className="mb-3">
                      <label htmlFor="currentPassword" className="form-label" style={{ fontWeight: '600', color: '#2d3748' }}>
                        Mot de passe actuel
                      </label>
                      <input
                        type="password"
                        className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        style={{
                          borderRadius: '12px',
                          padding: '12px 16px',
                          border: '2px solid #e5e7eb'
                        }}
                      />
                      {errors.currentPassword && <div className="invalid-feedback">{errors.currentPassword}</div>}
                    </div>

                    {/* New Password */}
                    <div className="mb-3">
                      <label htmlFor="newPassword" className="form-label" style={{ fontWeight: '600', color: '#2d3748' }}>
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        style={{
                          borderRadius: '12px',
                          padding: '12px 16px',
                          border: '2px solid #e5e7eb'
                        }}
                      />
                      {errors.newPassword && <div className="invalid-feedback">{errors.newPassword}</div>}
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label" style={{ fontWeight: '600', color: '#2d3748' }}>
                        Confirmer le mot de passe
                      </label>
                      <input
                        type="password"
                        className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        style={{
                          borderRadius: '12px',
                          padding: '12px 16px',
                          border: '2px solid #e5e7eb'
                        }}
                      />
                      {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn py-3"
                      disabled={loading}
                      style={{
                        backgroundColor: '#667eea',
                        color: 'white',
                        borderRadius: '25px',
                        border: 'none',
                        fontWeight: '600',
                        fontSize: '1rem'
                      }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Enregistrement...
                        </>
                      ) : (
                        'Enregistrer les modifications'
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary py-3"
                      onClick={() => navigate('/profile')}
                      style={{
                        borderRadius: '25px',
                        borderColor: '#d1d5db',
                        fontWeight: '600'
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProfilePage;
