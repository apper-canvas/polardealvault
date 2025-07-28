import Label from "@/components/atoms/Label";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Textarea from "@/components/atoms/Textarea";

const FormField = ({ label, type = "text", error, children, ...props }) => {
  const renderInput = () => {
    if (children) return children;
    
    switch (type) {
      case "select":
        return <Select {...props} />;
      case "textarea":
        return <Textarea {...props} />;
      default:
        return <Input type={type} {...props} />;
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {renderInput()}
      {error && (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
};

export default FormField;