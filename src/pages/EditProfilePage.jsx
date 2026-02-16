import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import Button from '../components/ui/Button';
import { toast } from '../components/ui/Toaster';

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

      toast.success('Profil mis à jour avec succès !');

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
      toast.error('Une erreur est survenue lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-dark transition-colors"
            onClick={() => navigate('/profile')}
          >
            <ArrowLeft className="w-5 h-5" />
            Retour au profil
          </button>
          <span className="text-primary font-semibold text-lg">
            Modifier le profil
          </span>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8">
            {/* Avatar Section */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Personal Information Section */}
              <div className="mb-6">
                <h5 className="text-primary font-semibold mb-4">
                  Informations personnelles
                </h5>

                {/* Name Field */}
                <div className="mb-4">
                  <Label htmlFor="name" className="mb-2 block">
                    Nom complet
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    className="h-12"
                  />
                  {errors.name && (
                    <p className="text-danger text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div className="mb-4">
                  <Label htmlFor="email" className="mb-2 block">
                    Adresse e-mail
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    className="h-12"
                  />
                  {errors.email && (
                    <p className="text-danger text-sm mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Change Password Section */}
              <hr className="border-gray-100 my-6" />
              <div className="mb-6">
                <h5 className="text-primary font-semibold mb-2">
                  Changer le mot de passe
                </h5>
                <p className="text-gray-500 text-sm mb-4">
                  Laissez vide si vous ne souhaitez pas changer votre mot de passe
                </p>

                {/* Current Password */}
                <div className="mb-4">
                  <Label htmlFor="currentPassword" className="mb-2 block">
                    Mot de passe actuel
                  </Label>
                  <Input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    error={!!errors.currentPassword}
                    className="h-12"
                  />
                  {errors.currentPassword && (
                    <p className="text-danger text-sm mt-1">{errors.currentPassword}</p>
                  )}
                </div>

                {/* New Password */}
                <div className="mb-4">
                  <Label htmlFor="newPassword" className="mb-2 block">
                    Nouveau mot de passe
                  </Label>
                  <Input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    error={!!errors.newPassword}
                    className="h-12"
                  />
                  {errors.newPassword && (
                    <p className="text-danger text-sm mt-1">{errors.newPassword}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="mb-4">
                  <Label htmlFor="confirmPassword" className="mb-2 block">
                    Confirmer le mot de passe
                  </Label>
                  <Input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={!!errors.confirmPassword}
                    className="h-12"
                  />
                  {errors.confirmPassword && (
                    <p className="text-danger text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  fullWidth
                  loading={loading}
                  className="rounded-full h-12 text-base"
                >
                  Enregistrer les modifications
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  fullWidth
                  className="rounded-full h-12"
                  onClick={() => navigate('/profile')}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default EditProfilePage;
