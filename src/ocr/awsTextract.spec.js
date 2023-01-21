require('dotenv').config();
jest.setTimeout(500000);
const { ocrPhotoId } = require('./');
const fs = require('fs');

const convertImageToBase64 = (image) => fs.readFileSync(image, 'base64');
describe('OCR a photoID using AWS Textract', () => {
  it('Should successfully extract information from photoID', async () => {
    const imageFile = convertImageToBase64(
      `./__test__/dummy_images/matching/idcard.jpg`
    );

    const response = await ocrPhotoId({
      photoId: Buffer.from(imageFile, 'base64'),
      confidenceThreshold: 20,
    });
    expect(response).toBeDefined();
    expect(Object.keys(response).length).toBeGreaterThan(0);
    expect(response).toHaveProperty('Name');
    expect(response).toHaveProperty('Gender');
    expect(response).toHaveProperty('Country of Stay');
    expect(response).toHaveProperty('Father Name');
  });
});
