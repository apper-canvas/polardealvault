import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";

const DealCard = ({ deal, onEdit, onDelete }) => {
  const getStatusVariant = (status) => {
    const variants = {
      "Active": "active",
      "Expired": "expired", 
      "Coming Soon": "coming",
      "Sold Out": "soldout"
    };
    return variants[status] || "default";
  };

  const getStatusIcon = (status) => {
    const icons = {
      "Active": "CheckCircle",
      "Expired": "XCircle",
      "Coming Soon": "Clock",
      "Sold Out": "ShoppingCart"
    };
    return icons[status] || "Circle";
  };

  const savings = deal.originalPrice && deal.ltdPrice 
    ? Math.round(((deal.originalPrice - deal.ltdPrice) / deal.originalPrice) * 100)
    : 0;

  return (
    <Card className="group hover:border-primary-200 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {deal.productName}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="primary" className="text-xs">
                {deal.platform}
              </Badge>
              <Badge variant={getStatusVariant(deal.status)} className="flex items-center gap-1">
                <ApperIcon name={getStatusIcon(deal.status)} className="h-3 w-3" />
                {deal.status}
              </Badge>
            </div>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(deal)}
              className="h-8 w-8 hover:bg-primary-50 hover:text-primary-600"
            >
              <ApperIcon name="Edit2" className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(deal)}
              className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
            >
              <ApperIcon name="Trash2" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Original Price</p>
                <p className="font-semibold text-gray-900 line-through">
                  ${deal.originalPrice}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">LTD Price</p>
                <p className="font-bold text-2xl bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  ${deal.ltdPrice}
                </p>
              </div>
            </div>
            {savings > 0 && (
              <Badge variant="accent" className="text-sm font-bold">
                Save {savings}%
              </Badge>
            )}
          </div>

          {deal.expiryDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ApperIcon name="Calendar" className="h-4 w-4" />
              <span>Expires {format(new Date(deal.expiryDate), "MMM dd, yyyy")}</span>
            </div>
          )}

          {deal.notes && (
            <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              {deal.notes}
            </div>
          )}

          <div className="text-xs text-gray-500 border-t pt-3">
            Added {format(new Date(deal.dateAdded), "MMM dd, yyyy")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DealCard;