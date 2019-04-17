//
//  WeatherViewController.swift
//  Clima
//
//  Created by Julien Shim on 4/16/19.
//  Copyright © 2019 Julien Shim. All rights reserved.
//

import UIKit

class WeatherViewController: UIViewController {
    
    let WEATHER_URL = "http://api.openweathermap.org/data/2.5/weather"
    let APP_ID = "Input label here when you're not lazy."
    
    @IBOutlet weak var weatherIcon: UIImageView!
    @IBOutlet weak var cityLabel: UILabel!
    @IBOutlet weak var temperatureLabel: UILabel!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view.
    }


}

