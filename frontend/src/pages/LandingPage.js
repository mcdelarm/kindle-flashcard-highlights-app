import "../styles/landing-page.css";
import { useState } from "react";
import FileUpload from "../components/FileUpload";

const LandingPage = () => {
  const [vocabFile, setVocabFile] = useState(null);
  const [clippingsFile, setClippingsFile] = useState(null);

  return (
    <main className="landing-page-container">
      <section className="landing-page-top">
        <div className="landing-page-slogan">
          Turn your reading into knowledge
        </div>
        <h1 className="landing-page-title">
          Convert Kindle Files into Flashcards and Highlights
        </h1>
        <div className="landing-page-description">
          Upload your Kindle clippings and vocab files to instantly generate
          organized highlights and flashcards for all the new words that you've
          encountered.
        </div>
        <div className="file-upload-container">
          <div className="vocab-upload-container">
            <div className="file-upload-container-top">
              <div className="file-upload-pill">vocab.db &rarr; Flashcards</div>
              <div className="file-upload-slogan">
                Build vocabulary flashcards
              </div>
              <div className="file-upload-description">
                Upload your Kindle vocab.db file to generate flashcards with the
                saved word, definition, and reading context.
              </div>
            </div>
            <div className="file-upload-container-bottom">
              <FileUpload
                accept={{
                  "application/x-sqlite3": [".db", ".sqlite", ".sqlite3"],
                }}
                buttonLabel="Choose vocab file"
                emptyTitle="Upload your Kindle vocab file"
                emptySubtitle="Drag and drop a vocab.db file here, or click to browse from your device."
                activeTitle="Drop your vocab file here"
                activeSubtitle="Release to attach the Kindle database for flashcard generation."
                acceptedFormatsLabel=".db, .sqlite, .sqlite3"
                iconLabel="DB"
                variant="vocab"
                onFileSelect={setVocabFile}
              />
              {vocabFile ? (
                <div className="file-upload-footer">
                  Ready to process: {vocabFile.name}
                </div>
              ) : null}
            </div>
          </div>
          <div className="clippings-upload-container">
            <div className="file-upload-container-top">
              <div className="file-upload-pill">
                My Clippings.txt &rarr; Highlights
              </div>
              <div className="file-upload-slogan">
                Import your reading highlights
              </div>
              <div className="file-upload-description">
                Upload your My Clippings.txt file to group your highlights by
                book, location, and date so they're easier to search later.
              </div>
            </div>
            <div className="file-upload-container-bottom">
              <FileUpload
                accept={{
                  "text/plain": [".txt"],
                }}
                buttonLabel="Choose highlights file"
                emptyTitle="Upload your My Clippings file"
                emptySubtitle="Drop the exported text file here, or browse to select your Kindle highlights."
                activeTitle="Drop your highlights file here"
                activeSubtitle="Release to attach the text export and organize highlights by book."
                acceptedFormatsLabel=".txt"
                iconLabel="TXT"
                variant="clippings"
                onFileSelect={setClippingsFile}
              />
              {clippingsFile ? (
                <div className="file-upload-footer file-upload-footer-clippings">
                  Ready to process: {clippingsFile.name}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
      <section className="landing-page-middle">
        <div className="instructions-container">
          <div className="instructions-header-container">
            <h2 className="instructions-title">
              Where to find your Kindle files?
            </h2>
            <p className="instructions-subtitle">
              Both files live in different folders. Use the steps for your
              computer to locate My Clippings.txt in documents and vocab.db in
              system/vocabulary.
            </p>
          </div>
          <div className="platform-grid">
            <div className="platform-card">
              <div className="platform-header">
                <div className="platform-label">PC / Windows </div>
                <div className="platform-chip">Direct USB Access</div>
              </div>
              <div className="platform-steps">
                <div className="step-card">
                  <div className="step-number">1</div>
                  <div className="step-description-container">
                    <h3 className="step-title">Connect your Kindle</h3>
                    <p className="step-desc">Use a USB cable to connect your Kindle e-reader to your computer. It should appear as an external drive in File Explorer.</p>
                  </div>
                </div>
                <div className="step-card">
                  <div className="step-number">2</div>
                  <div className="step-description-container">
                    <h3 className="step-title">Find your highlights file</h3>
                    <p className="step-desc">Open the kindle drive, then go to documents. Inside that folder, locate My Clippings.txt and upload it to the highlights file upload box above.</p>
                  </div>
                </div>
                <div className="step-card">
                  <div className="step-number">3</div>
                  <div className="step-description-container">
                    <h3 className="step-title">Find your vocabulary file</h3>
                    <p className="step-desc">From the main Kindle drive, open the system folder, then navigate to vocabulary. Inside that folder, locate vocab.db and upload it to the vocabulary file upload box above.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="platform-card">
              <div className="platform-header">
                <div className="platform-label">MacOS</div>
                <div className="platform-chip">Requires Amazon App</div>
              </div>
              <div className="mac-callout">
                <div className="icon-container">
                  <svg
                    className="info-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <rect
                      x="12"
                      y="8"
                      width="0.01"
                      height="0.01"
                      stroke="currentColor"
                      strokeWidth="3.75"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 12V16"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="mac-callout-text">
                  <div className="callout-title">Before you start</div>
                  <div className="callout-desc">Install Amazon Send-to-Kindle app <a target="_blank" rel="noopener noreferrer" href="https://www.amazon.com/gp/help/customer/display.html/ref=hp_Connect_USB_MTP?nodeId=TCUBEdEkbIhK07ysFu">here</a>. Older Mac and Kindle devices don't require a separate app to transfer files. Follow the PC/Windows instructions in this case as Kindle drive will show up in Finder once connected.</div>
                </div>
              </div>
              <div className="platform-steps">
                <div className="step-card">
                  <div className="step-number">1</div>
                  <div className="step-description-container">
                    <h3 className="step-title">Open your Kindle in the SendToKindle app</h3>
                    <p className="step-desc">Connect your Kindle with a USB cable, launch the Amazon SendToKindle app on your Mac, and open the USB file manager. There, you should see your Kindle device and its storage folders.</p>
                  </div>
                </div>
                <div className="step-card">
                  <div className="step-number">2</div>
                  <div className="step-description-container">
                    <h3 className="step-title">Find My Clippings.txt</h3>
                    <p className="step-desc">In the Kindle file browser, open documents and locate My Clippings.txt. Upload it to import your reading highlights.</p>
                  </div>
                </div>
                <div className="step-card">
                  <div className="step-number">3</div>
                  <div className="step-description-container">
                    <h3 className="step-title">Find vocab.db</h3>
                    <p className="step-desc">Go back to the main Kindle drive, open the system folder, then navigate to vocabulary. Inside that folder, locate vocab.db and upload it to generate vocabulary flashcards.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
