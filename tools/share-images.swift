// Render the 1200x630 link-preview images into assets/img/share/.
//
//     swift tools/share-images.swift
//
// macOS only (CoreGraphics). Re-run after replacing a hero photo; the build
// picks each image up through the "share" key in site.json.
//   - photo pages: the hero photo, navy fade at the bottom, white logo set in
//   - Our Founder: white logo on navy beside the portrait
//   - everything else: default.jpg, the white logo alone on navy
import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let W: CGFloat = 1200, H: CGFloat = 630
let root = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent().path
let img = root + "/assets/img/"
let out = img + "share/"

// output name: (source photo, vertical focus 0 = top … 1 = bottom)
let photos: [(String, String, CGFloat)] = [
    ("home", "hero-capabilities.jpg", 0.45),
    ("what-we-do", "hero-what-we-do.jpg", 0.5),
    ("who-we-serve", "hero-who-we-serve.jpg", 0.5),
    ("state-local-governments", "industry-state-local-governments.jpg", 0.5),
    ("federal-government", "industry-federal-government.jpg", 0.5),
    ("intergovernmental-organizations", "industry-intergovernmental-organizations.jpg", 0.5),
    ("k-12-schools", "industry-k-12-schools.jpg", 0.5),
    ("higher-education", "industry-higher-education.jpg", 0.5),
    ("nonprofits", "industry-nonprofits.jpg", 0.5),
    ("public-health", "industry-public-health.jpg", 0.5),
]

func load(_ name: String) -> CGImage {
    let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: img + name) as CFURL, nil)!
    return CGImageSourceCreateImageAtIndex(src, 0, nil)!
}
func navy(_ alpha: CGFloat = 1) -> CGColor {
    CGColor(srgbRed: 0, green: 0x25 / 255.0, blue: 0x4A / 255.0, alpha: alpha)
}
func canvas() -> CGContext {
    let c = CGContext(data: nil, width: Int(W), height: Int(H), bitsPerComponent: 8, bytesPerRow: 0,
                      space: CGColorSpace(name: CGColorSpace.sRGB)!,
                      bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    c.interpolationQuality = .high
    return c
}
func save(_ c: CGContext, _ name: String) {
    let dst = CGImageDestinationCreateWithURL(URL(fileURLWithPath: out + name + ".jpg") as CFURL,
                                              UTType.jpeg.identifier as CFString, 1, nil)!
    CGImageDestinationAddImage(dst, c.makeImage()!, [kCGImageDestinationLossyCompressionQuality: 0.72] as CFDictionary)
    CGImageDestinationFinalize(dst)
    print("  assets/img/share/\(name).jpg")
}
// fill rect with the image, cropping to keep focusY in view (CG origin is bottom-left)
func cover(_ c: CGContext, _ i: CGImage, _ r: CGRect, _ focusY: CGFloat) {
    let s = max(r.width / CGFloat(i.width), r.height / CGFloat(i.height))
    let w = CGFloat(i.width) * s, h = CGFloat(i.height) * s
    c.saveGState(); c.clip(to: r)
    c.draw(i, in: CGRect(x: r.minX + (r.width - w) / 2, y: r.minY - (h - r.height) * (1 - focusY), width: w, height: h))
    c.restoreGState()
}
func logo(_ c: CGContext, x: CGFloat, y: CGFloat, w: CGFloat) {
    let l = load("logo-white.png")
    c.draw(l, in: CGRect(x: x, y: y, width: w, height: w * CGFloat(l.height) / CGFloat(l.width)))
}

try? FileManager.default.createDirectory(atPath: out, withIntermediateDirectories: true)

for (name, src, focus) in photos {
    let c = canvas()
    cover(c, load(src), CGRect(x: 0, y: 0, width: W, height: H), focus)
    let fade = CGGradient(colorsSpace: nil, colors: [navy(0.96), navy(0.72), navy(0)] as CFArray, locations: [0, 0.4, 0.78])!
    c.drawLinearGradient(fade, start: .zero, end: CGPoint(x: 0, y: H), options: [])
    logo(c, x: 60, y: 48, w: 340)
    save(c, name)
}

let founder = canvas()
founder.setFillColor(navy()); founder.fill(CGRect(x: 0, y: 0, width: W, height: H))
cover(founder, load("lakeisha-sesay.jpg"), CGRect(x: 760, y: 0, width: 440, height: H), 0.75)
logo(founder, x: 70, y: (H - 600 * 243 / 760) / 2, w: 600)
save(founder, "our-founder")

let fallback = canvas()
fallback.setFillColor(navy()); fallback.fill(CGRect(x: 0, y: 0, width: W, height: H))
let lw: CGFloat = 900
logo(fallback, x: (W - lw) / 2, y: (H - lw * 243 / 760) / 2, w: lw)
save(fallback, "default")
