import { useState } from "react";
import { FaTimes, FaFileCsv, FaDownload, FaChalkboardTeacher, FaCheckCircle, FaPaperPlane } from 'react-icons/fa';
import { toast } from "react-toastify";

const TeacherCSVUploadModal = ({ schoolId, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Result

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error("Please upload a CSV file");
        return;
      }
      setFile(selectedFile);
      previewCSV(selectedFile);
    }
  };

  const previewCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length === 0) {
        toast.error("CSV file is empty");
        return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        const row = {};
        headers.forEach((header, index) => {
          const key = header.toLowerCase().replace(/\s+/g, '');
          row[key] = values[index] ? values[index].trim() : '';
        });
        return row;
      }).filter(row => Object.values(row).some(val => val));
      
      setPreviewData(data);
      setStep(2);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('csvFile', file);
    formData.append('schoolId', schoolId);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/school-admin/bulk-upload/teachers`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message || "Teachers uploaded successfully!");
        setStep(3);
        onSuccess();
      } else {
        toast.error(data.message || "Upload failed");
        setUploading(false);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed. Please try again.");
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    if (!file) {
      toast.error("Please upload a CSV file first");
      return;
    }
    
    // Create a download link for the uploaded file
    const blob = new Blob([file], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teachers_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.info("Uploaded CSV file downloaded");
  };

  // Function to download a sample template (separate from uploaded file)
  const downloadSampleTemplate = () => {
    const templateHeaders = ["name", "email", "subject", "qualification", "phone", "experience"];
    const csvContent = templateHeaders.join(",") + "\n" +
      "Dr. Robert Johnson,robert.j@example.com,Mathematics,Ph.D. in Mathematics,9876543210,10 years\n" +
      "Ms. Sarah Williams,sarah.w@example.com,Science,M.Sc. in Physics,9876543211,8 years";
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teacher_sample_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.info("Sample template downloaded");
  };

  // Get proper display headers
  const getDisplayHeaders = () => {
    return [
      { key: "name", display: "Name" },
      { key: "email", display: "Email" },
      { key: "subject", display: "Subject" },
      { key: "qualification", display: "Qualification" },
      { key: "phone", display: "Phone" },
      { key: "experience", display: "Experience" }
    ];
  };

  const validatePreviewData = () => {
    const errors = [];
    previewData.forEach((row, index) => {
      if (!row.name || row.name.length < 2) {
        errors.push(`Row ${index + 1}: Name is required`);
      }
      if (!row.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        errors.push(`Row ${index + 1}: Valid email is required`);
      }
      if (!row.subject || row.subject.length < 2) {
        errors.push(`Row ${index + 1}: Subject is required`);
      }
    });
    return errors;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50 p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <FaChalkboardTeacher className="text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  Bulk Upload Teachers
                </h2>
                <p className="mt-1 opacity-90">
                  {step === 1 && "Upload a CSV file with teacher details"}
                  {step === 2 && "Preview the data before uploading"}
                  {step === 3 && "Upload completed successfully"}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= stepNum ? 'bg-white text-purple-600' : 'bg-white/30 text-white'}`}>
                    {stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div className={`w-16 h-1 mx-2 ${step > stepNum ? 'bg-white' : 'bg-white/30'}`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Modal Body - Scrollable area */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="text-center">
              <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 mb-6 hover:border-purple-500 transition-colors">
                <FaFileCsv className="text-5xl text-purple-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload Teacher CSV File</h3>
                <p className="text-gray-600 mb-4">
                  Upload a CSV file containing teacher details. Ensure the file follows the required format.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Required columns: <span className="font-semibold">name, email, subject, qualification, phone, experience</span>
                </p>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 inline-block transition-colors cursor-pointer">
                    Choose CSV File
                  </div>
                </label>
                <p className="text-sm text-gray-500 mt-4">
                  {file ? `Selected: ${file.name}` : "No file selected"}
                </p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={downloadSampleTemplate}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mx-auto"
                >
                  <FaDownload />
                  Download Sample Template
                </button>
                
                <div className="text-sm text-gray-500">
                  <p className="font-medium mb-1">CSV Format Example:</p>
                  <div className="bg-gray-50 p-3 rounded-lg font-mono text-xs">
                    name,email,subject,qualification,phone,experience<br/>
                    Dr. Robert Johnson,robert@example.com,Mathematics,Ph.D.,9876543210,10 years<br/>
                    Ms. Sarah Williams,sarah@example.com,Science,M.Sc.,9876543211,8 years
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col h-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Preview Teacher Data ({previewData.length} rows)</h3>
              
              {/* Validation Errors */}
              {(() => {
                const errors = validatePreviewData();
                if (errors.length > 0) {
                  return (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 font-medium mb-2">Please fix the following errors:</p>
                      <ul className="text-sm text-red-600 list-disc pl-5">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  );
                }
              })()}
              
              {/* Scrollable Table Container */}
              <div className="flex-1 overflow-auto mb-6 border border-gray-200 rounded-lg">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {getDisplayHeaders().map((header, index) => (
                        <th key={index} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          {header.display}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {previewData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        {getDisplayHeaders().map((header, colIndex) => (
                          <td key={colIndex} className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                            {row[header.key] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Fixed Button Row at Bottom */}
              <div className="mt-auto pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Back
                  </button>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={downloadTemplate}
                      className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                      <FaDownload />
                      Download CSV
                    </button>
                    <div className="text-sm text-gray-600">
                      {previewData.length} teacher{previewData.length !== 1 ? 's' : ''} will be created
                    </div>
                  </div>
                  <button
                    onClick={handleUpload}
                    disabled={uploading || validatePreviewData().length > 0}
                    className="px-6 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <span className="animate-spin">⟳</span>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        Upload Teachers
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Teachers Uploaded Successfully!</h3>
              <p className="text-gray-600 mb-6">
                Teacher accounts have been created and credentials have been sent to their email addresses.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-medium mb-1">What happens next:</p>
                <ul className="text-sm text-green-700 text-left list-disc pl-5">
                  <li>Teachers receive login credentials via email</li>
                  <li>Accounts are created with temporary passwords</li>
                  <li>Teachers need platform admin approval to login</li>
                  <li>You can track approval status in Teacher Management</li>
                  <li>Teachers can generate AI assessments after approval</li>
                </ul>
              </div>
              
              <div className="flex justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onClose();
                    // You can add navigation to teacher management here
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  View Teachers
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherCSVUploadModal;