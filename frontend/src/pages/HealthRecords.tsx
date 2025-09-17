import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DiseaseAutocomplete } from "@/components/DiseaseAutocomplete";
import Logo from "@/components/Logo";
import {
  Plus,
  FileText,
  Calendar,
  User,
  Building,
  Shield,
  Search,
  Filter,
  MoreHorizontal,
  ArrowLeft,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface HealthRecord {
  id: number;
  title: string;
  record_type: string;
  description: string;
  icd11_code?: string;
  icd11_title?: string;
  diagnosis?: string;
  symptoms?: string[];
  namaste_name?: string;
  doctor_name?: string;
  hospital_name?: string;
  visit_date?: string;
  severity: string;
  verification_status: string;
  created_at: string;
  updated_at: string;
}

interface NewRecordForm {
  recordType: string;
  title: string;
  description: string;
  icd11Code: string;
  icd11Title: string;
  diagnosis: string;
  symptoms: string;
  doctorName: string;
  hospitalName: string;
  visitDate: string;
  severity: string;
  namasteName: string;
}

const HealthRecords = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null);
  const [formData, setFormData] = useState<NewRecordForm>({
    recordType: "",
    title: "",
    description: "",
    icd11Code: "",
    icd11Title: "",
    diagnosis: "",
    namasteName: "",
    symptoms: "",
    doctorName: "",
    hospitalName: "",
    visitDate: "",
    severity: "mild",
  });

  useEffect(() => {
    fetchHealthRecords();
  }, []);

  const fetchHealthRecords = async () => {
    try {
      // First try to load from localStorage
      const storedRecords = localStorage.getItem("health_records");
      if (storedRecords) {
        try {
          const parsedRecords = JSON.parse(storedRecords);
          setRecords(parsedRecords);
          setLoading(false);
          return;
        } catch (error) {
          console.error("Error parsing stored health records:", error);
        }
      }

      // If no stored records, try API (for future backend integration)
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/health-records", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecords(data.data);
        // Save to localStorage for offline access
        localStorage.setItem("health_records", JSON.stringify(data.data));
      } else {
        // If API fails, just set empty array
        console.log("API not available, using local storage only");
        setRecords([]);
      }
    } catch (error) {
      console.error("Failed to fetch health records:", error);
      // Fallback to empty array if everything fails
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSampleRecord = async () => {
    // Create a sample record with predefined data
    const sampleRecord = {
      id: Date.now(),
      title: "John Doe",
      record_type: "consultation",
      description: "This is a sample health record for demonstration purposes.",
      icd11_code: "8A00",
      icd11_title: "Primary headache disorders",
      diagnosis: "Tension-type headache",
      symptoms: ["headache", "stress"],
      namaste_name: "स्वास्थ्य रिकॉर्ड (Health Record)",
      doctor_name: "Dr. Sample Physician",
      hospital_name: "Sample Medical Center",
      visit_date: new Date().toISOString().split("T")[0],
      severity: "mild",
      verification_status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updatedRecords = [...records, sampleRecord];
    setRecords(updatedRecords);

    // Save to localStorage so Dashboard can access it
    localStorage.setItem("health_records", JSON.stringify(updatedRecords));

    toast.success("Sample health record added successfully");
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingRecordId) {
        // Update existing record
        const updatedRecord = {
          id: editingRecordId,
          title: formData.title,
          record_type: formData.recordType,
          description: formData.description,
          icd11_code: formData.icd11Code,
          icd11_title: formData.icd11Title,
          diagnosis: formData.diagnosis,
          symptoms: formData.symptoms
            ? formData.symptoms.split(",").map((s) => s.trim())
            : [],
          namaste_name: formData.namasteName,
          doctor_name: formData.doctorName,
          hospital_name: formData.hospitalName,
          visit_date: formData.visitDate,
          severity: formData.severity,
          verification_status:
            records.find((r) => r.id === editingRecordId)
              ?.verification_status || "pending",
          created_at:
            records.find((r) => r.id === editingRecordId)?.created_at ||
            new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const updatedRecords = records.map((record) =>
          record.id === editingRecordId ? updatedRecord : record
        );
        setRecords(updatedRecords);
        localStorage.setItem("health_records", JSON.stringify(updatedRecords));
        toast.success("Health record updated successfully");
      } else {
        // Create new record
        const newRecord = {
          id: Date.now(),
          title: formData.title,
          record_type: formData.recordType,
          description: formData.description,
          icd11_code: formData.icd11Code,
          icd11_title: formData.icd11Title,
          diagnosis: formData.diagnosis,
          symptoms: formData.symptoms
            ? formData.symptoms.split(",").map((s) => s.trim())
            : [],
          namaste_name: formData.namasteName,
          doctor_name: formData.doctorName,
          hospital_name: formData.hospitalName,
          visit_date: formData.visitDate,
          severity: formData.severity,
          verification_status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const updatedRecords = [...records, newRecord];
        setRecords(updatedRecords);
        localStorage.setItem("health_records", JSON.stringify(updatedRecords));
        toast.success("Health record created successfully");
      }

      // Reset form and close dialog
      setIsDialogOpen(false);
      setEditingRecordId(null);
      setFormData({
        recordType: "",
        title: "",
        description: "",
        icd11Code: "",
        icd11Title: "",
        diagnosis: "",
        symptoms: "",
        namasteName: "",
        doctorName: "",
        hospitalName: "",
        visitDate: "",
        severity: "mild",
      });
    } catch (error) {
      console.error("Failed to save health record:", error);
      toast.error("Failed to create health record");
    }
  };

  const handleVerifyRecord = async (recordId: number) => {
    try {
      // Update record verification status locally (since API might not exist)
      const updatedRecords = records.map((record) =>
        record.id === recordId
          ? {
              ...record,
              verification_status: "verified",
              updated_at: new Date().toISOString(),
            }
          : record
      );

      setRecords(updatedRecords);

      // Save to localStorage
      localStorage.setItem("health_records", JSON.stringify(updatedRecords));

      toast.success("Record verified successfully");

      // Try API call in background (optional)
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`/api/verification/verify/${recordId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ verificationType: "full" }),
        });

        if (response.ok) {
          console.log("Record also verified on server");
        }
      } catch (apiError) {
        console.log("API not available, verified locally only");
      }
    } catch (error) {
      console.error("Verification failed:", error);
      toast.error("Verification failed");
    }
  };

  const handleDeleteRecord = async (recordId: number) => {
    try {
      // Remove record from local state
      const updatedRecords = records.filter((record) => record.id !== recordId);
      setRecords(updatedRecords);

      // Update localStorage
      localStorage.setItem("health_records", JSON.stringify(updatedRecords));

      toast.success("Health record deleted successfully");

      // Try API call in background (optional)
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`/api/health-records/${recordId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          console.log("Record also deleted on server");
        }
      } catch (apiError) {
        console.log("API not available, deleted locally only");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete record");
    }
  };

  const handleEditRecord = (record: HealthRecord) => {
    // Set form data with the selected record's data
    setFormData({
      recordType: record.record_type,
      title: record.title,
      description: record.description,
      icd11Code: record.icd11_code || "",
      icd11Title: record.icd11_title || "",
      diagnosis: record.diagnosis || "",
      symptoms: record.symptoms ? record.symptoms.join(", ") : "",
      namasteName: record.namaste_name || "",
      doctorName: record.doctor_name || "",
      hospitalName: record.hospital_name || "",
      visitDate: record.visit_date || "",
      severity: record.severity,
    });

    // Store the record ID for editing
    setEditingRecordId(record.id);

    // Open the dialog
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRecordId(null);
    setFormData({
      recordType: "",
      title: "",
      description: "",
      icd11Code: "",
      icd11Title: "",
      diagnosis: "",
      symptoms: "",
      namasteName: "",
      doctorName: "",
      hospitalName: "",
      visitDate: "",
      severity: "mild",
    });
  };

  // Removed duplicate handleCreateRecord. Add local record creation logic to main handleCreateRecord.

  // To support local table update, add this inside the main handleCreateRecord after successful API response:
  // setRecords([
  //   ...records,
  //   {
  //     id: Date.now(),
  //     title: formData.title,
  //     record_type: formData.recordType,
  //     description: formData.description,
  //     icd11_code: formData.icd11Code,
  //     icd11_title: formData.icd11Title,
  //     diagnosis: formData.diagnosis,
  //     symptoms: formData.symptoms ? formData.symptoms.split(",").map((s) => s.trim()) : [],
  //     doctor_name: formData.doctorName,
  //     hospital_name: formData.hospitalName,
  //     visit_date: formData.visitDate,
  //     severity: formData.severity,
  //     verification_status: "pending",
  //     created_at: new Date().toISOString(),
  //     updated_at: new Date().toISOString(),
  //   },
  // ]);

  // Removed unreachable/stray code after local setRecords/setFormData logic

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.record_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.namaste_name &&
        record.namaste_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filterType === "all" || record.record_type === filterType;

    return matchesSearch && matchesFilter;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "mild":
        return "bg-green-100 text-green-800";
      case "moderate":
        return "bg-yellow-100 text-yellow-800";
      case "severe":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const recordTypes = [
    "consultation",
    "lab_result",
    "prescription",
    "imaging",
    "surgery",
    "vaccination",
    "emergency",
    "follow_up",
    "other",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <Logo size="md" showText={true} to="/" />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Health Records
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage and organize your medical history
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleCreateSampleRecord}
          >
            <FileText className="h-4 w-4" />
            Add Sample Record
          </Button>

          <Button
            className="flex items-center gap-2"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add New Record
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingRecordId
                    ? "Edit Health Record"
                    : "Create New Health Record"}
                </DialogTitle>
                <DialogDescription>
                  Add a new health record to your medical history
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateRecord} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recordType">Record Type</Label>
                    <Select
                      value={formData.recordType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, recordType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select record type" />
                      </SelectTrigger>
                      <SelectContent>
                        {recordTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type
                              .replace("_", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="severity">Severity</Label>
                    <Select
                      value={formData.severity}
                      onValueChange={(value) =>
                        setFormData({ ...formData, severity: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mild">Mild</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="severe">Severe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="title">Patient's Name</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter patient's name"
                    required
                  />
                </div>

                {/* Description field removed as requested */}

                {/* Disease Section */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <DiseaseAutocomplete
                      onDiseaseSelect={(disease) => {
                        setFormData({
                          ...formData,
                          icd11Code: disease.code,
                          icd11Title: disease.title,
                          diagnosis: disease.title,
                          namasteName: disease.namaste || "",
                          symptoms: disease.symptoms || formData.symptoms,
                        });
                      }}
                      label="Disease/Condition"
                      placeholder="Type disease name or symptoms..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="namasteName">Namaste Name</Label>
                    <Input
                      id="namasteName"
                      value={formData.namasteName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          namasteName: e.target.value,
                        })
                      }
                      placeholder="Namaste name (e.g., chaechak, Madhumeha)"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="icd11Code">ICD-11 Code</Label>
                      <Input
                        id="icd11Code"
                        value={formData.icd11Code}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            icd11Code: e.target.value,
                          })
                        }
                        placeholder="e.g., BA00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="icd11Title">ICD-11 Title</Label>
                      <Input
                        id="icd11Title"
                        value={formData.icd11Title}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            icd11Title: e.target.value,
                          })
                        }
                        placeholder="ICD-11 condition title"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Textarea
                    id="diagnosis"
                    value={formData.diagnosis}
                    onChange={(e) =>
                      setFormData({ ...formData, diagnosis: e.target.value })
                    }
                    placeholder="Medical diagnosis"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="symptoms">Symptoms</Label>
                  <Input
                    id="symptoms"
                    value={formData.symptoms}
                    onChange={(e) =>
                      setFormData({ ...formData, symptoms: e.target.value })
                    }
                    placeholder="Comma-separated symptoms"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="doctorName">Doctor Name</Label>
                    <Input
                      id="doctorName"
                      value={formData.doctorName}
                      onChange={(e) =>
                        setFormData({ ...formData, doctorName: e.target.value })
                      }
                      placeholder="Dr. John Smith"
                    />
                  </div>

                  <div>
                    <Label htmlFor="hospitalName">Hospital/Clinic</Label>
                    <Input
                      id="hospitalName"
                      value={formData.hospitalName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hospitalName: e.target.value,
                        })
                      }
                      placeholder="General Hospital"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="visitDate">Visit Date</Label>
                  <Input
                    id="visitDate"
                    type="date"
                    value={formData.visitDate}
                    onChange={(e) =>
                      setFormData({ ...formData, visitDate: e.target.value })
                    }
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingRecordId ? "Update Record" : "Create Record"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search health records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {recordTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type
                  .replace("_", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecords.map((record) => (
          <Card key={record.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg truncate">
                    {record.title}
                  </CardTitle>
                  <CardDescription className="capitalize text-sm">
                    {record.record_type.replace("_", " ")}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleEditRecord(record)}
                      className="flex items-center gap-2 text-blue-600 focus:text-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Record
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="flex items-center gap-2 text-red-600 focus:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Record
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete Health Record
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{record.title}"?
                            This action cannot be undone and will permanently
                            remove this health record from your account.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteRecord(record.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Record
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 sm:space-y-3">
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-3">
                  {record.description}
                </p>

                {record.icd11_code && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 shrink-0" />
                    <span className="font-medium truncate">
                      {record.icd11_code}
                    </span>
                    <span className="text-gray-600 truncate">
                      {record.icd11_title}
                    </span>
                  </div>
                )}

                {record.namaste_name && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <span className="text-gray-400 shrink-0">🏥</span>
                    <span className="font-medium text-blue-600 truncate">
                      {record.namaste_name}
                    </span>
                  </div>
                )}

                {record.doctor_name && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 shrink-0" />
                    <span className="truncate">{record.doctor_name}</span>
                  </div>
                )}

                {record.hospital_name && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Building className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 shrink-0" />
                    <span className="truncate">{record.hospital_name}</span>
                  </div>
                )}

                {record.visit_date && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 shrink-0" />
                    <span className="truncate">
                      {new Date(record.visit_date).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
                  <div className="flex gap-1 sm:gap-2 flex-wrap">
                    <Badge
                      className={`text-xs ${getSeverityColor(record.severity)}`}
                    >
                      {record.severity}
                    </Badge>
                    <Badge
                      className={`text-xs ${getStatusColor(
                        record.verification_status
                      )}`}
                    >
                      {record.verification_status}
                    </Badge>
                  </div>

                  {record.verification_status !== "verified" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerifyRecord(record.id)}
                      className="flex items-center gap-1 text-xs sm:text-sm h-7 sm:h-8 shrink-0"
                    >
                      <Shield className="h-3 w-3" />
                      <span className="hidden sm:inline">Verify</span>
                      <span className="sm:hidden">✓</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-8 sm:py-12 px-4">
          <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterType !== "all"
              ? "No matching records"
              : "No health records yet"}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 max-w-md mx-auto">
            {searchTerm || filterType !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Start by adding your first health record"}
          </p>
          {!searchTerm && filterType === "all" && (
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Record
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default HealthRecords;
