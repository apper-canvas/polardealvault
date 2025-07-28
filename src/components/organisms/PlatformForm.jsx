import { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";

const PlatformForm = ({ platform, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    logoUrl: ""
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (platform) {
      setFormData({
        name: platform.name || "",
        url: platform.url || "",
        logoUrl: platform.logoUrl || ""
      });
    }
  }, [platform]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Platform name is required";
    }

    if (!formData.url.trim()) {
      newErrors.url = "Platform URL is required";
    } else if (!/^https?:\/\/.+/.test(formData.url)) {
      newErrors.url = "Please enter a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        label="Platform Name"
        value={formData.name}
        onChange={(e) => handleChange("name", e.target.value)}
        placeholder="Enter platform name"
        error={errors.name}
      />

      <FormField
        label="Platform URL"
        type="url"
        value={formData.url}
        onChange={(e) => handleChange("url", e.target.value)}
        placeholder="https://example.com"
        error={errors.url}
      />

      <FormField
        label="Logo URL (Optional)"
        type="url"
        value={formData.logoUrl}
        onChange={(e) => handleChange("logoUrl", e.target.value)}
        placeholder="https://example.com/logo.png"
      />

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex items-center gap-2"
        >
          <ApperIcon name={platform ? "Save" : "Plus"} className="h-4 w-4" />
          {platform ? "Update Platform" : "Add Platform"}
        </Button>
      </div>
    </form>
  );
};

export default PlatformForm;