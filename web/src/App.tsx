import { useState } from 'react'
import {
  calculateEstimate,
  formatCurrency,
  getRenovationTypeDefinition,
  renovationTypes,
  type EstimateDraft,
  type RenovationType,
} from './domain/estimator'
import './App.css'

const draftStorageKey = 'renolens:draft:v2'

interface DraftReadResult {
  draft: EstimateDraft | null
  error?: string
}

function readDraft(): DraftReadResult {
  try {
    const storedDraft = window.localStorage.getItem(draftStorageKey)
    if (!storedDraft) return { draft: null }

    const parsed: unknown = JSON.parse(storedDraft)
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('renovationType' in parsed) ||
      !('quantity' in parsed) ||
      typeof parsed.renovationType !== 'string' ||
      typeof parsed.quantity !== 'number' ||
      !Number.isFinite(parsed.quantity)
    ) {
      throw new Error('The saved draft has an unsupported format.')
    }

    const savedType = getRenovationTypeDefinition(parsed.renovationType)
    if (
      parsed.quantity < 1 ||
      parsed.quantity > savedType.maxQuantity
    ) {
      throw new Error('The saved draft has an unsupported format.')
    }

    return {
      draft: {
        renovationType: savedType.id,
        quantity: parsed.quantity,
      },
    }
  } catch (error) {
    return {
      draft: null,
      error:
        error instanceof Error
          ? error.message
          : 'The saved draft could not be read.',
    }
  }
}

function App() {
  const initialDraft = readDraft()
  const [renovationType, setRenovationType] = useState<RenovationType>(
    initialDraft.draft?.renovationType ?? 'flooring',
  )
  const [quantityInput, setQuantityInput] = useState(
    String(initialDraft.draft?.quantity ?? 8),
  )
  const [notice, setNotice] = useState(initialDraft.error ?? '')
  const selectedRenovation = getRenovationTypeDefinition(renovationType)
  const quantity = Number(quantityInput)
  const quantityIsValid =
    Number.isFinite(quantity) &&
    quantity >= 1 &&
    quantity <= selectedRenovation.maxQuantity
  const estimate = quantityIsValid
    ? calculateEstimate(renovationType, quantity)
    : null

  function saveDraft() {
    if (!quantityIsValid) {
      setNotice(selectedRenovation.unitHint)
      return
    }

    try {
      window.localStorage.setItem(
        draftStorageKey,
        JSON.stringify({ renovationType, quantity }),
      )
      setNotice('Draft saved on this device.')
    } catch (error) {
      setNotice(
        error instanceof Error
          ? `Could not save this draft: ${error.message}`
          : 'Could not save this draft in this browser.',
      )
    }
  }

  async function copyRequestBrief() {
    if (!quantityIsValid) return

    const brief = [
      `Request for an indicative quote: ${selectedRenovation.label.toLowerCase()}`,
      '',
      `${selectedRenovation.quantityLabel}: ${quantity} ${selectedRenovation.unit}`,
      'Location: Netherlands (postcode to be confirmed)',
      'I may source materials from Poland. Please quote Dutch installation labour separately and state product compatibility, preparation, warranty, delivery, and VAT assumptions.',
      '',
      'Please include separate estimates for labour, materials, delivery, VAT, expected timing, and any exclusions or likely additional costs.',
      '',
      'This is a request for a professional quote; the online estimate is for early planning only.',
    ].join('\n')

    try {
      await navigator.clipboard.writeText(brief)
      setNotice('RFQ brief copied. Add your location before sending it.')
    } catch (error) {
      setNotice(
        error instanceof Error
          ? `Could not copy the RFQ brief: ${error.message}`
          : 'Could not copy the RFQ brief. Check browser clipboard permissions.',
      )
    }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="RenoLens home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path d="M5 15.2 16 6l11 9.2v11H5v-11Z" />
              <path d="M12 26v-8h8v8M3 15.5 16 4l13 11.5" />
            </svg>
          </span>
          <span>reno<span className="brand-light">lens</span></span>
        </a>
        <nav className="header-actions" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#assumptions">Our assumptions</a>
          <span className="pilot-badge"><span /> Early access</span>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-line" /> PLAN WITH CLARITY</p>
            <h1>A better starting point for your renovation.</h1>
            <p className="hero-description">
              Start with a sourced Polish flooring product and a separate
              Netherlands installation estimate. More categories will appear
              only when comparable source data is available.
            </p>
            <a className="text-link" href="#estimator">
              Build your first estimate <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-sun" />
            <div className="art-room">
              <div className="art-window"><span /><span /><span /><span /></div>
              <div className="art-cabinet"><i /><i /><i /></div>
              <div className="art-counter" />
              <div className="art-plant"><i /><i /><i /><b /></div>
              <div className="art-floor" />
            </div>
            <div className="art-note"><span>01</span><span>Plan before you build</span></div>
          </div>
          <div className="hero-footnote">
            <span className="footnote-icon" aria-hidden="true">i</span>
            <span>Planning guidance, not a contractor quote.</span>
          </div>
        </section>

        <section className="estimator-section" id="estimator">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><span className="eyebrow-line" /> YOUR PROJECT</p>
              <h2>Start with the essentials</h2>
            </div>
            <span className="step-label"><span>01</span> PROJECT SCOPE</span>
          </div>

          <div className="estimator-layout">
            <form
              className="scope-card"
              onSubmit={(event) => event.preventDefault()}
            >
              <div className="card-heading">
                <span className="number-bubble">1</span>
                <div>
                  <h3>Tell us what you’re planning</h3>
                  <p>A couple of details is enough to get started.</p>
                </div>
              </div>

              <label htmlFor="renovation-type">What are you renovating?</label>
              <div className="select-wrap">
                <select
                  id="renovation-type"
                  value={renovationType}
                  onChange={(event) => {
                    let nextRenovation
                    try {
                      nextRenovation = getRenovationTypeDefinition(
                        event.target.value,
                      )
                    } catch {
                      setNotice('Choose a supported renovation type.')
                      return
                    }
                    setRenovationType(nextRenovation.id)
                    setQuantityInput(String(nextRenovation.defaultQuantity))
                    setNotice('')
                  }}
                >
                  {renovationTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
                <span aria-hidden="true">⌄</span>
              </div>

              <label htmlFor="project-quantity">
                {selectedRenovation.quantityLabel}
              </label>
              <div className="area-input-wrap">
                <input
                  id="project-quantity"
                  type="number"
                  min="1"
                  max={selectedRenovation.maxQuantity}
                  step={selectedRenovation.step}
                  value={quantityInput}
                  onChange={(event) => setQuantityInput(event.target.value)}
                  aria-describedby="quantity-hint"
                  aria-invalid={quantityInput !== '' && !quantityIsValid}
                />
                <span>{selectedRenovation.unit}</span>
              </div>
              <p className="input-hint" id="quantity-hint">
                {selectedRenovation.unitHint}
              </p>
              {!quantityIsValid && (
                <p className="validation-message" role="alert">
                  {selectedRenovation.unitHint}
                </p>
              )}

              <div className="scope-divider" />
              <div className="scope-location">
                <span className="location-icon" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none">
                    <path d="M16 8.2c0 4.3-6 9-6 9s-6-4.7-6-9a6 6 0 1 1 12 0Z" />
                    <circle cx="10" cy="8" r="2" />
                  </svg>
                </span>
                <span><strong>Netherlands</strong><small>No regional adjustment applied</small></span>
                <span className="location-tag">NL</span>
              </div>

              <button className="button button-primary save-button" type="button" onClick={saveDraft}>
                Save this draft <span aria-hidden="true">↗</span>
              </button>
              <button className="button button-quiet brief-button" type="button" onClick={copyRequestBrief} disabled={!quantityIsValid}>
                Copy a quote request brief
              </button>
              {notice && <p className="notice" role="status">{notice}</p>}
              <p className="privacy-note">
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <rect x="3" y="7" width="10" height="7" rx="1.5" />
                  <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
                </svg>
                Your draft stays in this browser.
              </p>
            </form>

            <div className="comparison-panel" aria-live="polite">
              <div className="comparison-heading">
                <div>
                  <span className="result-kicker">POLISH MATERIALS · DUTCH LABOUR</span>
                  <h3>Itemized planning estimate</h3>
                </div>
                <span className="source-label">
                  {renovationType === 'flooring'
                    ? 'DATED SOURCE SNAPSHOT'
                    : 'SOURCE DATA PENDING'}
                </span>
              </div>

              {estimate ? (
                <div className="sourced-estimate">
                  <div className="sourced-total">
                    <span>Known-cost subtotal · delivery, VAT, and extras unconfirmed</span>
                    <strong>
                      {formatCurrency(estimate.totalLowEUR)}
                      <i>–</i>
                      {formatCurrency(estimate.totalHighEUR)}
                    </strong>
                  </div>

                  <div className="itemized-list" aria-label="Itemized estimate">
                    <div className="itemized-row">
                      <div>
                        <strong>Polish SPC vinyl flooring</strong>
                        <span>
                          {estimate.packageCount} packs × {estimate.packageAreaM2} m²
                          {' '}at {estimate.packagePricePLN.toFixed(2)} PLN/pack
                          {' '}({estimate.materialCostPerM2PLN.toFixed(2)} PLN/m²
                          {' '}≈ {formatCurrency(estimate.materialCostPerM2EUR)}/m²)
                          {' · '}covers {estimate.purchasedAreaM2.toFixed(2)} m²
                          {' · '}~{estimate.excessAreaM2.toFixed(2)} m² leftover
                        </span>
                        <a href={estimate.materialSourceUrl} target="_blank" rel="noreferrer">
                          Castorama Poland · listing observed {estimate.observedDate}
                        </a>
                      </div>
                      <strong>
                        {estimate.materialCostPLN.toFixed(2)} PLN
                        <span>≈ {formatCurrency(estimate.materialCostEUR)}</span>
                      </strong>
                    </div>
                    <div className="itemized-row">
                      <div>
                        <strong>Professional PVC floor installation · Netherlands</strong>
                        <span>
                          {estimate.areaM2} m² × €{estimate.labourLowPerM2EUR}–€
                          {estimate.labourHighPerM2EUR}/m² · published guide range,
                          not a contractor quote
                        </span>
                        <a href={estimate.labourSourceUrl} target="_blank" rel="noreferrer">
                          Click-PVC · 2026 installation price guide
                        </a>
                      </div>
                      <strong>
                        {formatCurrency(estimate.labourCostLowEUR)}–
                        {formatCurrency(estimate.labourCostHighEUR)}
                      </strong>
                    </div>
                  </div>

                  <p className="fx-note">
                    PLN conversion uses the ECB reference rate dated {estimate.fxDate}:
                    {' '}€1 = {estimate.eurToPln} PLN. The product listing is a Polish
                    price snapshot, not a live feed.
                  </p>

                  <div className="product-quality">
                    <strong>Product details listed by the retailer</strong>
                    <span>
                      Use class 32 · 0.4 mm wear layer · CE marking · A+ VOC rating ·
                      stated 20-year manufacturer warranty. The product page showed
                      no customer rating when checked. The Dutch retailer’s guide
                      cites {formatCurrency(estimate.comparisonMaterialLowEURPerM2)}–
                      {formatCurrency(estimate.comparisonMaterialHighEURPerM2)}/m² for
                      quality click-PVC material, but the products are not matched
                      for specification. This price difference is not proof of
                      equivalent quality or savings.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="empty-estimate">
                  <span aria-hidden="true">↗</span>
                  <p>
                    {quantityIsValid
                      ? 'No source-backed itemized estimate is available for this renovation type yet. No demo price is shown.'
                      : 'Enter a valid project size to see an estimate.'}
                  </p>
                </div>
              )}

              <div className="estimate-foot">
                <span className="estimate-foot-icon" aria-hidden="true">!</span>
                <p>
                  <strong>Not a vendor offer.</strong> The labour figure is a Dutch
                  retailer’s published guide, not a selected or vetted installer
                  quote. VAT basis and delivery from Poland to the Netherlands are
                  unconfirmed. The product requires a separate 1 mm underlay, which
                  is not priced here; subfloor preparation, trims, removal, and
                  other extras are also excluded.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="how-section" id="how-it-works">
          <div className="how-heading">
            <p className="eyebrow"><span className="eyebrow-line" /> A CLEARER WAY FORWARD</p>
            <h2>Three routes. One clearer comparison.</h2>
          </div>
          <div className="how-grid">
            <article>
              <span className="how-number">01</span>
              <h3>One full-service contractor</h3>
              <p>One point of contact coordinates labour and materials. Ask how the quote handles product choices and changes.</p>
            </article>
            <article>
              <span className="how-number">02</span>
              <h3>Separate labour and materials</h3>
              <p>Contract independently for the work and the products. Compare responsibilities, delivery dates, and warranties.</p>
            </article>
            <article>
              <span className="how-number">03</span>
              <h3>Source materials yourself</h3>
              <p>Choose and arrange delivery of materials yourself, while agreeing clearly with your tradesperson on what they will install.</p>
            </article>
          </div>
        </section>

        <section className="assumptions-section" id="assumptions">
          <div className="assumptions-mark" aria-hidden="true">↗</div>
          <div>
            <p className="eyebrow"><span className="eyebrow-line" /> TRANSPARENCY FIRST</p>
            <h2>Know what’s behind the numbers.</h2>
            <p>
              Flooring uses a dated Polish product listing, an ECB exchange rate,
              and a published Netherlands installation-cost guide. These are
              snapshots, not live prices or contractor quotations. Bathroom,
              toilet-room, kitchen, and painting estimates remain unavailable
              until we can source comparable products and labour costs without
              inventing a bill of materials.
            </p>
            <div className="assumption-tags">
              <span>Sources dated</span><span>Flooring pilot only</span><span>Cross-border delivery unverified</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#top">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path d="M5 15.2 16 6l11 9.2v11H5v-11Z" />
              <path d="M12 26v-8h8v8M3 15.5 16 4l13 11.5" />
            </svg>
          </span>
          <span>reno<span className="brand-light">lens</span></span>
        </a>
        <p>Make your next step a more informed one.</p>
        <span className="footer-disclaimer">Planning tool only · Not a professional quote</span>
      </footer>
    </div>
  )
}

export default App
