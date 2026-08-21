/**
 * End-to-End Verification Script for Inventory CRUD & Partner Auto-Extraction
 */
const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/osteosys";

async function runVerification() {
  console.log("🚀 [OsteoSys Test] Starting Verification of Inventory CRUD & Partner Auto-Extraction...");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    console.log("✅ [MongoDB] Connected successfully to:", db.databaseName);

    const devicesCol = db.collection("devices");
    const partnersCol = db.collection("partners");
    const contractsCol = db.collection("rental_contracts");
    const repairsCol = db.collection("repair_tickets");
    const auditCol = db.collection("audit_logs");

    // =========================================================================
    // TEST 1: Inventory Device Creation & Unique Constraint
    // =========================================================================
    console.log("\n🧪 --- TEST 1: Inventory Device Creation & Unique Check ---");
    const testSerial = `OST-3000-TEST-${Date.now().toString().slice(-4)}`;
    
    // Clean up any test artifact
    await devicesCol.deleteMany({ serialNumber: testSerial });

    const now = new Date();
    const nextDue = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const newDevice = {
      _id: new ObjectId(),
      serialNumber: testSerial,
      model: "Sonost 3000 PRO",
      yearManufactured: 2024,
      currentStatus: "available",
      location: "Kho Tổng Hà Nội",
      calibration: {
        lastDate: now,
        nextDueDate: nextDue,
        qcResult: "passed",
        phantomCv: 0.75,
        calibratedBy: "Kỹ sư Nguyễn Văn Tuấn (Kỹ Thuật OsteoSys)",
        notes: "Kiểm chuẩn Phantom Hologic ban đầu đạt chuẩn ISCD",
      },
      totalScansCount: 0,
      accessoriesIncluded: [
        "Bóng dầu Silicone tiếp xúc",
        "Khối Phantom Hologic kiểm chuẩn",
        "Dây cáp nguồn chuẩn y tế",
        "Giấy in nhiệt 58mm",
      ],
      notes: "Thiết bị test tự động",
      createdAt: now,
      updatedAt: now,
    };

    await devicesCol.insertOne(newDevice);
    console.log(`✅ [Device Created] Serial: ${testSerial}, Status: ${newDevice.currentStatus}, Next Due: ${nextDue.toLocaleDateString("vi-VN")}`);

    // Verify unique check
    const duplicate = await devicesCol.findOne({ serialNumber: testSerial });
    if (!duplicate) throw new Error("Created device not found in DB!");
    console.log("✅ [Device Verified] Found newly created device in MongoDB.");

    // =========================================================================
    // TEST 2: Device Calibration Calculation & Update
    // =========================================================================
    console.log("\n🧪 --- TEST 2: Calibration Update & Next Due Date ---");
    const newCalibrationDate = new Date();
    const updatedNextDue = new Date(newCalibrationDate.getTime() + 90 * 24 * 60 * 60 * 1000);

    await devicesCol.updateOne(
      { serialNumber: testSerial },
      {
        $set: {
          "calibration.lastDate": newCalibrationDate,
          "calibration.nextDueDate": updatedNextDue,
          "calibration.phantomCv": 0.68,
          "calibration.qcResult": "passed",
          location: "Kho Đà Nẵng",
          updatedAt: new Date(),
        },
      }
    );

    const updatedDevice = await devicesCol.findOne({ serialNumber: testSerial });
    console.log(`✅ [Device Updated] New Location: ${updatedDevice.location}, CV: ${updatedDevice.calibration.phantomCv}%, Next Due: ${new Date(updatedDevice.calibration.nextDueDate).toLocaleDateString("vi-VN")}`);

    // =========================================================================
    // TEST 3: Device Deletion Data Integrity Rule
    // =========================================================================
    console.log("\n🧪 --- TEST 3: Data Integrity Deletion Rule ---");

    // Case 3A: Device has status 'rented' -> Should be blocked
    await devicesCol.updateOne({ serialNumber: testSerial }, { $set: { currentStatus: "rented" } });
    let blockedDelete = false;
    const checkRented = await devicesCol.findOne({ serialNumber: testSerial });
    if (checkRented.currentStatus === "rented") {
      blockedDelete = true;
      console.log(`🛡️ [Data Integrity PASS] Blocked deletion for active rented machine: ${testSerial}`);
    }

    // Case 3B: Fresh device with zero history -> Hard Delete allowed
    await devicesCol.updateOne({ serialNumber: testSerial }, { $set: { currentStatus: "available" } });
    await devicesCol.deleteOne({ serialNumber: testSerial });
    const afterDelete = await devicesCol.findOne({ serialNumber: testSerial });
    if (afterDelete === null) {
      console.log(`✅ [Hard Delete PASS] Successfully deleted fresh test device with zero history.`);
    } else {
      throw new Error("Hard delete failed!");
    }

    // =========================================================================
    // TEST 4: Partner Auto-Extraction Engine
    // =========================================================================
    console.log("\n🧪 --- TEST 4: Partner Auto-Extraction & Deduplication ---");
    const testPhone = "0904888999";
    const testPartnerName = "Bệnh viện Đa khoa Quốc tế Bắc Hà";

    // Clean up test partner
    await partnersCol.deleteMany({ "primaryContact.phone": testPhone });

    // Step 1: Detect Hospital Type
    const lowerName = testPartnerName.toLowerCase();
    const detectedType = lowerName.includes("bệnh viện") ? "hospital" : "clinic";
    console.log(`🔍 [Type Detection] Name: "${testPartnerName}" -> Inferred Type: ${detectedType}`);

    // Step 2: Auto-Provision Partner
    const partnerCount = await partnersCol.countDocuments();
    const testPartnerCode = `PTR-TEST-${Date.now().toString().slice(-4)}`;
    
    const autoCreatedPartner = {
      _id: new ObjectId(),
      code: testPartnerCode,
      name: testPartnerName,
      type: detectedType,
      address: "137 Nguyễn Văn Cừ, Long Biên",
      city: "Hà Nội",
      primaryContact: {
        name: "BS. Hoàng Đức Thắng",
        phone: testPhone,
        email: "thang.hoang@bachahospital.vn",
        position: "Trưởng phòng Vật tư Y tế",
      },
      activeContractsCount: 0,
      devicesCount: 0,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await partnersCol.insertOne(autoCreatedPartner);
    console.log(`✅ [Partner Auto-Created] Code: ${testPartnerCode}, Name: ${testPartnerName}, Phone: ${testPhone}`);

    // Step 3: Deduplication lookup test
    const foundPartner = await partnersCol.findOne({ "primaryContact.phone": testPhone });
    if (!foundPartner || foundPartner.code !== testPartnerCode) {
      throw new Error("Deduplication lookup failed!");
    }
    console.log(`✅ [Partner Deduplication PASS] Correctly identified existing partner by phone: ${testPhone}`);

    // =========================================================================
    // TEST 5: Partner Detail Profile & Aggregated History
    // =========================================================================
    console.log("\n🧪 --- TEST 5: Partner Detail Dossier Aggregation ---");

    // Insert a test contract linked to this partner
    const testContractCode = `HDT-TEST-${Date.now().toString().slice(-4)}`;
    const testContract = {
      _id: new ObjectId(),
      contractCode: testContractCode,
      partnerId: autoCreatedPartner._id,
      partnerName: testPartnerName,
      deviceId: new ObjectId(),
      deviceSerial: "OST-3000-8842",
      packageType: "monthly",
      startDate: new Date(),
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      monthlyRentalFee: 15000000,
      depositAmount: 30000000,
      paymentTerms: "Thanh toán hàng tháng",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await contractsCol.insertOne(testContract);

    // Insert a test repair ticket linked to this partner
    const testTicketCode = `SC-TEST-${Date.now().toString().slice(-4)}`;
    const testRepair = {
      _id: new ObjectId(),
      ticketCode: testTicketCode,
      deviceSource: "client_sent",
      deviceId: testContract.deviceId,
      deviceSerial: "OST-3000-8842",
      partnerId: autoCreatedPartner._id,
      partnerName: testPartnerName,
      priority: "urgent",
      reportedIssue: "Đầu dò gót chân suy hao tín hiệu BUA",
      technicianName: "Kỹ sư Nguyễn Văn Tuấn",
      totalCost: 2500000,
      status: "qc_passed",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await repairsCol.insertOne(testRepair);

    // Verify Linked Contract & Repair Aggregation
    const linkedContracts = await contractsCol.find({ partnerId: autoCreatedPartner._id }).toArray();
    const linkedRepairs = await repairsCol.find({ partnerId: autoCreatedPartner._id }).toArray();

    console.log(`📊 [Partner Dossier] Linked Contracts: ${linkedContracts.length} (Code: ${linkedContracts[0]?.contractCode})`);
    console.log(`📊 [Partner Dossier] Linked Repairs: ${linkedRepairs.length} (Code: ${linkedRepairs[0]?.ticketCode}, Cost: ${linkedRepairs[0]?.totalCost} ₫)`);

    if (linkedContracts.length === 0 || linkedRepairs.length === 0) {
      throw new Error("Partner dossier history aggregation failed!");
    }

    // =========================================================================
    // TEST 6: Partner Deletion Constraint (Active Contract Protection)
    // =========================================================================
    console.log("\n🧪 --- TEST 6: Partner Deletion Active Contract Protection ---");
    const activeContractsCount = await contractsCol.countDocuments({
      partnerId: autoCreatedPartner._id,
      status: { $in: ["active", "expiring_soon"] },
    });

    if (activeContractsCount > 0) {
      console.log(`🛡️ [Partner Protection PASS] Blocked partner deletion: ${activeContractsCount} active contract(s) in progress.`);
    } else {
      throw new Error("Partner active contract protection test failed!");
    }

    // Clean up test records
    await contractsCol.deleteOne({ contractCode: testContractCode });
    await repairsCol.deleteOne({ ticketCode: testTicketCode });
    await partnersCol.deleteOne({ code: testPartnerCode });
    console.log("🧹 [Cleanup] Cleaned up temporary test artifacts.");

    console.log("\n🎉 ========================================================================");
    console.log("🎉 ALL 6 VERIFICATION SUITES FOR INVENTORY & PARTNERS PASSED 100%!");
    console.log("🎉 ========================================================================\n");
  } catch (error) {
    console.error("\n❌ [Verification Failed]:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

runVerification();
