import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button, TextField } from "@radix-ui/themes";
import { Loader2, Plus, X, ExternalLink } from "lucide-react";
import { cn } from "../lib/utils";

type SocialLink = {
  platform: string;
  url: string;
};

type FormData = {
  username: string;
  bio: string;
  avatarUrl: string;
  isPublic: boolean;
  socialLinks: SocialLink[];
};

export default function EditProfilePage() {
  const navigate = useNavigate();
  const profile = useQuery(api.todos.getCurrentUserProfile);
  const updateProfile = useMutation(api.todos.updateUserProfile);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    bio: "",
    avatarUrl: "",
    isPublic: true,
    socialLinks: [],
  });

  const [newSocialLink, setNewSocialLink] = useState<SocialLink>({
    platform: "",
    url: "",
  });
  const [formErrors, setFormErrors] = useState<{
    username?: string;
    avatarUrl?: string;
    socialLinks?: string;
  }>({});

  // Update form data when profile loads
  useEffect(() => {
    if (profile?.profile) {
      setFormData({
        username: profile.profile.username,
        bio: profile.profile.bio || "",
        avatarUrl: profile.profile.avatarUrl || "",
        isPublic: profile.profile.isPublic ?? true,
        socialLinks: profile.profile.socialLinks || [],
      });
    }
  }, [profile?.profile]);

  const validateForm = () => {
    const errors: typeof formErrors = {};

    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (formData.avatarUrl && !isValidUrl(formData.avatarUrl)) {
      errors.avatarUrl = "Please enter a valid URL";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await updateProfile(formData);
      navigate(`/profile/${formData.username}`);
    } catch (error) {
      console.error("Failed to update profile:", error);
      // Handle error appropriately
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSocialLink = () => {
    if (!newSocialLink.platform.trim() || !newSocialLink.url.trim()) {
      setFormErrors((prev) => ({
        ...prev,
        socialLinks: "Both platform and URL are required",
      }));
      return;
    }

    if (!isValidUrl(newSocialLink.url)) {
      setFormErrors((prev) => ({
        ...prev,
        socialLinks: "Please enter a valid URL",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, newSocialLink],
    }));
    setNewSocialLink({ platform: "", url: "" });
    setFormErrors((prev) => ({ ...prev, socialLinks: undefined }));
  };

  const removeSocialLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
  };

  if (profile === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Profile Not Found
          </h2>
          <p className="text-gray-600 mt-2">Please create a profile first.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username *
            </label>
            <TextField.Root
              type="text"
              value={formData.username}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, username: e.target.value }));
                if (formErrors.username) {
                  setFormErrors((prev) => ({ ...prev, username: undefined }));
                }
              }}
              radius="medium"
              className={cn("w-full", formErrors.username && "border-red-500")}
            />
            {formErrors.username && (
              <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, bio: e.target.value }))
              }
              className="w-full min-h-[100px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell others about yourself..."
            />
          </div>

          {/* Avatar URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Avatar URL
            </label>
            <Input
              type="url"
              value={formData.avatarUrl}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, avatarUrl: e.target.value }));
                if (formErrors.avatarUrl) {
                  setFormErrors((prev) => ({ ...prev, avatarUrl: undefined }));
                }
              }}
              className={cn("w-full", formErrors.avatarUrl && "border-red-500")}
              placeholder="https://example.com/avatar.jpg"
            />
            {formErrors.avatarUrl && (
              <p className="mt-1 text-sm text-red-600">
                {formErrors.avatarUrl}
              </p>
            )}
            {formData.avatarUrl && !formErrors.avatarUrl && (
              <div className="mt-2">
                <img
                  src={formData.avatarUrl}
                  alt="Avatar preview"
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = ""; // Clear the image
                    setFormErrors((prev) => ({
                      ...prev,
                      avatarUrl: "Failed to load image",
                    }));
                  }}
                />
              </div>
            )}
          </div>

          {/* Profile Visibility */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isPublic: e.target.checked,
                  }))
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Make profile public
              </span>
            </label>
          </div>

          {/* Social Links */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Social Links</h2>
            <div className="space-y-4">
              {formData.socialLinks.map((link, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{link.platform}</span>
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 truncate max-w-[200px]"
                    >
                      {link.url}
                    </a>
                  </div>
                  <Button
                    type="button"
                    variant="soft"
                    color="red"
                    onClick={() => removeSocialLink(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Platform (e.g., Twitter)"
                  value={newSocialLink.platform}
                  onChange={(e) =>
                    setNewSocialLink((prev) => ({
                      ...prev,
                      platform: e.target.value,
                    }))
                  }
                  className="w-1/3"
                />
                <Input
                  type="url"
                  placeholder="URL"
                  value={newSocialLink.url}
                  onChange={(e) =>
                    setNewSocialLink((prev) => ({
                      ...prev,
                      url: e.target.value,
                    }))
                  }
                  className="w-2/3"
                />
                <Button type="button" onClick={addSocialLink} variant="soft">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formErrors.socialLinks && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.socialLinks}
                </p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button
              type="button"
              variant="soft"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
