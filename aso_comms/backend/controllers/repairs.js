// controllers/repairs.js -> createRepair function
exports.createRepair = async (req, res) => {
  try {
    const { hardware = {}, accessories = {} } = req.body;

    const repairData = {
      ...req.body,
      hardwareChecklist: {
        powerButton: hardware.powerButton === 'on',
        screenTouch: hardware.screenTouch === 'on',
        displayImage: hardware.displayImage === 'on',
        chargingPort: hardware.chargingPort === 'on',
        frontCamera: hardware.frontCamera === 'on',
        backCamera: hardware.backCamera === 'on',
        speakers: hardware.speakers === 'on',
        microphone: microphone === 'on',
        wifiBluetooth: hardware.wifiBluetooth === 'on',
        faceIdFingerprint: hardware.faceIdFingerprint === 'on'
      },
      accessoriesChecklist: {
        simTray: accessories.simTray === 'on',
        memoryCard: accessories.memoryCard === 'on',
        protectiveCase: accessories.protectiveCase === 'on',
        charger: accessories.charger === 'on',
        originalBox: accessories.originalBox === 'on'
      }
    };

    const newRepair = new Repair(repairData);
    await newRepair.save();

    req.flash('success', 'Repair ticket successfully created with intake checklist!');
    res.redirect(`/repairs/${newRepair._id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to create repair ticket.');
    res.redirect('/repairs/new');
  }
};