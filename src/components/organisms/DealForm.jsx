import { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import Select from "@/components/atoms/Select";
import ApperIcon from "@/components/ApperIcon";

const DealForm = ({ deal, onSubmit, onCancel, platforms = [] }) => {
  const [formData, setFormData] = useState({
    productName: "",
    platform: "",
    originalPrice: "",
    ltdPrice: "",
    status: "Active",
    expiryDate: "",
    notes: ""
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (deal) {
      setFormData({
        productName: deal.productName || "",
        platform: deal.platform || "",
        originalPrice: deal.originalPrice?.toString() || "",
        ltdPrice: deal.ltdPrice?.toString() || "",
        status: deal.status || "Active",
        expiryDate: deal.expiryDate ? deal.expiryDate.split("T")[0] : "",
        notes: deal.notes || ""
      });
    }
  }, [deal]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.productName.trim()) {
      newErrors.productName = "Product name is required";
    }

    if (!formData.platform.trim()) {
      newErrors.platform = "Platform is required";
    }

    if (!formData.originalPrice || isNaN(formData.originalPrice) || parseFloat(formData.originalPrice) <= 0) {
      newErrors.originalPrice = "Please enter a valid original price";
    }

    if (!formData.ltdPrice || isNaN(formData.ltdPrice) || parseFloat(formData.ltdPrice) <= 0) {
      newErrors.ltdPrice = "Please enter a valid LTD price";
    }

    if (formData.originalPrice && formData.ltdPrice && parseFloat(formData.ltdPrice) >= parseFloat(formData.originalPrice)) {
      newErrors.ltdPrice = "LTD price should be less than original price";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const dealData = {
      ...formData,
      originalPrice: parseFloat(formData.originalPrice),
      ltdPrice: parseFloat(formData.ltdPrice),
      expiryDate: formData.expiryDate || null
    };

    onSubmit(dealData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Product Name"
          value={formData.productName}
          onChange={(e) => handleChange("productName", e.target.value)}
          placeholder="Enter product name"
          error={errors.productName}
        />

        <FormField
          label="Platform"
          error={errors.platform}
        >
          <Select
            value={formData.platform}
            onChange={(e) => handleChange("platform", e.target.value)}
          >
            <option value="">Select platform</option>
            {platforms.map((platform) => (
              <option key={platform.Id} value={platform.name}>
                {platform.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Original Price"
          type="number"
          value={formData.originalPrice}
          onChange={(e) => handleChange("originalPrice", e.target.value)}
          placeholder="0.00"
          min="0"
          step="0.01"
          error={errors.originalPrice}
        />

        <FormField
          label="LTD Price"
          type="number"
          value={formData.ltdPrice}
          onChange={(e) => handleChange("ltdPrice", e.target.value)}
          placeholder="0.00"
          min="0"
          step="0.01"
          error={errors.ltdPrice}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Status"
        >
          <Select
            value={formData.status}
            onChange={(e) => handleChange("status", e.target.value)}
          >
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
            <option value="Coming Soon">Coming Soon</option>
            <option value="Sold Out">Sold Out</option>
          </Select>
        </FormField>

        <FormField
          label="Expiry Date (Optional)"
          type="date"
          value={formData.expiryDate}
          onChange={(e) => handleChange("expiryDate", e.target.value)}
        />
      </div>

      <FormField
        label="Notes (Optional)"
        type="textarea"
        value={formData.notes}
        onChange={(e) => handleChange("notes", e.target.value)}
        placeholder="Add any additional notes about this deal..."
        rows={3}
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
          <ApperIcon name={deal ? "Save" : "Plus"} className="h-4 w-4" />
          {deal ? "Update Deal" : "Add Deal"}
        </Button>
      </div>
    </form>
  );
};

export default DealForm;